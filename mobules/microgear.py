#   NETPIE Microgear Micropython
#   Version: 1.0.3
#   Author: Chavee Issariyapat (i@chavee.com)
#   MQTT client used in the library was slightly modified from umqtt.simple (https://github.com/micropython/micropython-lib/tree/master/micropython/umqtt.simple)

try:
    import usocket as socket
except:
    import socket
import ustruct as struct
from ubinascii import hexlify

import _thread
import time
import ujson

class MQTTException(Exception):
    pass

MQTT_STATE_DISCONNECTED  = 0
MQTT_STATE_CONNECTING    = 1
MQTT_STATE_CONNECTED     = 2

class MQTTClient:
    def __init__(self, client_id, server, port=0, user=None, password=None, keepalive=30, ssl=False, ssl_params={}):
        if port == 0:
            port = 8883 if ssl else 1883
        self.client_id = client_id
        self.sock = None
        self.server = server
        self.port = port
        self.ssl = ssl
        self.ssl_params = ssl_params
        self.pid = 0
        self.cb = None
        self.user = user
        self.pswd = password
        self.keepalive = keepalive
        self.lw_topic = None
        self.lw_msg = None
        self.lw_qos = 0
        self.lw_retain = False
        self.mqtt_state = MQTT_STATE_DISCONNECTED
        self.connected_cb = None
        self.disconnected_cb = None
        self.message_cb = None


    def setConnectedCallback(self, cb):
        self.connected_cb = cb

    def setDisconnectedCallback(self, cb):
        self.disconnected_cb = cb

    def setMessageCallback(self, cb):
        self.message_cb = cb


    def _send_str(self, s):
        self.sock.write(struct.pack("!H", len(s)))
        self.sock.write(s)

    def _recv_len(self):
        n = 0
        sh = 0
        while 1:
            b = self.sock.read(1)[0]
            n |= (b & 0x7f) << sh
            if not b & 0x80:
                return n
            sh += 7

    def set_callback(self, f):
        self.cb = f

    def set_last_will(self, topic, msg, retain=False, qos=0):
        assert 0 <= qos <= 2
        assert topic
        self.lw_topic = topic
        self.lw_msg = msg
        self.lw_qos = qos
        self.lw_retain = retain

    def connect(self, clean_session=True):
        self.sock = socket.socket()
        self.mqtt_state = MQTT_STATE_CONNECTING
        addr = socket.getaddrinfo(self.server, self.port)[0][-1]
        self.sock.connect(addr)
        if self.ssl:
            import ussl
            self.sock = ussl.wrap_socket(self.sock, **self.ssl_params)
        premsg = bytearray(b"\x10\0\0\0\0\0")
        msg = bytearray(b"\x04MQTT\x04\x02\0\0")

        sz = 10 + 2 + len(self.client_id)
        msg[6] = clean_session << 1
        if self.user is not None:
            sz += 2 + len(self.user) + 2 + len(self.pswd)
            msg[6] |= 0xC0
        if self.keepalive:
            assert self.keepalive < 65536
            msg[7] |= self.keepalive >> 8
            msg[8] |= self.keepalive & 0x00FF
        if self.lw_topic:
            sz += 2 + len(self.lw_topic) + 2 + len(self.lw_msg)
            msg[6] |= 0x4 | (self.lw_qos & 0x1) << 3 | (self.lw_qos & 0x2) << 3
            msg[6] |= self.lw_retain << 5

        i = 1
        while sz > 0x7f:
            premsg[i] = (sz & 0x7f) | 0x80
            sz >>= 7
            i += 1
        premsg[i] = sz

        self.sock.write(premsg, i + 2)
        self.sock.write(msg)
        self._send_str(self.client_id)
        if self.lw_topic:
            self._send_str(self.lw_topic)
            self._send_str(self.lw_msg)
        if self.user is not None:
            self._send_str(self.user)
            self._send_str(self.pswd)

        resp = self.sock.read(4)
        assert resp[0] == 0x20 and resp[1] == 0x02
        if resp[3] != 0:
            raise MQTTException(resp[3])

        self.mqtt_state = MQTT_STATE_CONNECTED
        if (self.connected_cb):
            self.connected_cb()
        return resp[2] & 1

    def disconnect(self):
        self.mqtt_state = MQTT_STATE_DISCONNECTED
        self.sock.write(b"\xe0\0")
        self.sock.close()

    def ping(self):
        self.sock.write(b"\xc0\0")

    def publish(self, topic, msg, retain=False, qos=0):
        pkt = bytearray(b"\x30\0\0\0")
        pkt[0] |= qos << 1 | retain
        sz = 2 + len(topic) + len(msg)
        if qos > 0:
            sz += 2
        assert sz < 2097152
        i = 1
        while sz > 0x7f:
            pkt[i] = (sz & 0x7f) | 0x80
            sz >>= 7
            i += 1
        pkt[i] = sz
        self.sock.write(pkt, i + 1)
        self._send_str(topic)
        if qos > 0:
            self.pid += 1
            pid = self.pid
            struct.pack_into("!H", pkt, 0, pid)
            self.sock.write(pkt, 2)
        self.sock.write(msg)
        if qos == 1:
            while 1:
                op = self.wait_msg()
                if op == 0x40:
                    sz = self.sock.read(1)
                    assert sz == b"\x02"
                    rcv_pid = self.sock.read(2)
                    rcv_pid = rcv_pid[0] << 8 | rcv_pid[1]
                    if pid == rcv_pid:
                        return
        elif qos == 2:
            assert 0

    def subscribe(self, topic, qos=0):
        pkt = bytearray(b"\x82\0\0\0")
        self.pid += 1
        struct.pack_into("!BH", pkt, 1, 2 + 2 + len(topic) + 1, self.pid)
        self.sock.write(pkt)
        self._send_str(topic)
        self.sock.write(qos.to_bytes(1, "little"))
        while 1:
            op = self.wait_msg()
            if op == 0x90:
                resp = self.sock.read(4)
                assert resp[1] == pkt[2] and resp[2] == pkt[3]
                if resp[3] == 0x80:
                    raise MQTTException(resp[3])
                return

    def wait_msg(self):
        try:
            res = self.sock.read(1)
        except OSError as e:
            self.disconnect()
            self.mqtt_state = MQTT_STATE_DISCONNECTED
            print(e)
            return

        self.sock.setblocking(True)
        if res is None:
            return None
        if res == b"":
            raise OSError(-1)
        if res == b"\xd0":  # PINGRESP
            sz = self.sock.read(1)[0]
            assert sz == 0
            return None
        op = res[0]
        if op & 0xf0 != 0x30:
            return op
        sz = self._recv_len()
        topic_len = self.sock.read(2)
        topic_len = (topic_len[0] << 8) | topic_len[1]
        topic = self.sock.read(topic_len)
        sz -= topic_len + 2
        if op & 6:
            pid = self.sock.read(2)
            pid = pid[0] << 8 | pid[1]
            sz -= 2
        msg = self.sock.read(sz)
        topic = topic.decode('ascii')   # Cast topic to string
        if (self.message_cb):
            self.message_cb(topic, msg)

        if op & 6 == 2:
            pkt = bytearray(b"\x40\x02\0\0")
            struct.pack_into("!H", pkt, 2, pid)
            self.sock.write(pkt)
        elif op & 6 == 4:
            assert 0

    def check_msg(self):
        try:
            self.sock.setblocking(False)
            return self.wait_msg()
        except OSError as e:
            print("Socket Error")
            print(e)

    def reconnect(self):
        try:
            self.connect()
        except OSError as e:
            print(e.errno)



class Microgear:
    def mg_message_cb(self, topic, payload):
        if topic.startswith('@msg/'):
            for tc in self.topic_callbacks:
                if self.topicMatched(tc[0],topic):
                    tc[1](topic, payload)
        elif topic == '@shadow/data/updated':
            try:
                sobj = ujson.loads(payload)
                for sc in self.shadowupdated_callbacks:
                    sc(sobj['data'])
            except KeyError as e:
                    pass
        elif topic == '@private/shadow/data/get/response':
            sobj = ujson.loads(payload)
            for sgc in self.shadowget_callbacks:
                sgc(sobj)
            self.shadowget_callbacks.clear()

    def mg_connected_cb(self):
        self.mqttclient.subscribe('@private/#')
        self.mqttclient.subscribe('@shadow/data/updated')
        for t in self.topic_subscriptions:
            self.mqttclient.subscribe(t)
        for c in self.connected_callbacks:
            c()

    def mg_disconnected_cb(self):
        for c in self.disconnected_callbacks:
            c()

    def __init__(self, deviceid, devicetoken):
        self.deviceid = deviceid
        self.devicetoken = devicetoken
        self.mqttclient = MQTTClient(deviceid, "mqtt.netpie.io", user=devicetoken, password='', keepalive=30)
        self.lastping = 0

        self.mqttclient.setMessageCallback(self.mg_message_cb)
        self.mqttclient.setConnectedCallback(self.mg_connected_cb)

        self.connected_callbacks = []
        self.topic_callbacks = []
        self.disconnected_callbacks = []
        self.shadowupdated_callbacks = []
        self.topic_subscriptions = []
        self.shadowget_callbacks = []

    def on(self, event, cb):
        if   event == 'Message' :
            self.topic_callbacks.append(['@msg/#', cb])
        elif event == 'ShadowUpdated' :
            self.shadowupdated_callbacks.append(cb)
        elif event == 'Connected' :
            self.connected_callbacks.append(cb)
        elif event == 'Disconnected' :
            self.disconnected_callbacks.append(cb)
        elif event.startswith('@msg/'):
            self.topic_callbacks.append([event, cb])
        elif event == '@shadow/data/updated':
            self.shadowupdated_callbacks.append(cb)
        elif event.startswith('@private/'):
            self.topic_callbacks.append([event, cb])

    def subscribe(self, topic):
        if topic not in self.topic_subscriptions:
            self.topic_subscriptions.append(topic)
        if self.mqttclient.mqtt_state == MQTT_STATE_CONNECTED:
            self.mqttclient.subscribe(topic)

    def check_msg(self):
        if (self.mqttclient.mqtt_state) == MQTT_STATE_CONNECTED:
            return self.mqttclient.check_msg()
        elif (self.mqttclient.mqtt_state == MQTT_STATE_DISCONNECTED):
            print("reconnected...")
            self.mqttclient.connect()

    def tick(self):
        while True:
            print('microgear tick ...')
            if (time.time() - self.lastping > self.mqttclient.keepalive):
                self.lastping = time.time()
                print("PING NOW",self.lastping)
                self.mqttclient.ping()
            self.check_msg()
            time.sleep(0.5)

    def connect(self, wait=0.25, run=False):
        if not run :
            _thread.start_new_thread(self.connect, (wait, True))
        else:
            time.sleep(wait)
            self.mqttclient.connect()
            _thread.start_new_thread(self.tick, ())

    def getShadowData(self, cb):
        if self.mqttclient.mqtt_state == MQTT_STATE_CONNECTED:
            self.shadowget_callbacks.append(cb)
            self.mqttclient.publish('@shadow/data/get','')

    def publish(self, topic, payload):
        if self.mqttclient.mqtt_state == MQTT_STATE_CONNECTED:
            self.mqttclient.publish(topic, payload)

    def writeShadowField(self, field, value):
        def covertDotNotationToJSON(path, val):
            value = None
            out = {}
            a = path.split('.')
            for i in range(len(a)-1, -1, -1) :
                if value is None :
                    out[a[i]] = val
                else:
                    out[a[i]] = value.copy()

                value = out;
                out = {}
            return value;

        payload = ujson.dumps({'data': covertDotNotationToJSON(field, value)})
        self.mqttclient.publish('@shadow/data/update', payload)

    def topicMatched(self, sub, topic):
        s = 0
        t = 0
        while s<len(sub):
            if sub[s] == '#':
                if s+1 == len(sub): return 1
                else: return 0
            elif sub[s] == '+':
                if t == len(topic) or (s+1<len(sub) and sub[s+1]!='/'): return 0
            else:
                while s<len(sub) and sub[s]!='/' and t<len(topic) and topic[t]!='/':
                    if sub[s]!=topic[t]: return 0
                    s = s+1
                    t = t+1
                if (s<len(sub) and sub[s]!='/') or (t<len(topic) and topic[t]!='/'): return 0

            while s<len(sub) and sub[s]!='/': s=s+1
            while t<len(topic) and topic[t]!='/':t=t+1

            if s<len(sub) and sub[s]=='/': s = s+1
            if t<len(topic) and topic[t]=='/': t = t+1

        if t == len(topic): return 1
        else: return 0
