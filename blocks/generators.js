let cb_netpie_on_connected_count = 0;
let cb_netpie_on_disconnected_count = 0;
let cb_netpie_on_reveived_msg_count = 0;
let cb_netpie_read_shadow_count = 0;
let cb_netpie_on_shadow_updated_count = 0;

function objectDotToBracket(path) {
  return path.split('.').map(item => `['${item}']`).join('');
}

function objectDotToJSON(path, val) {
  let out = {};
  let value;
  let a = path.split('.');
  for (let i=a.length-1; i>=0; i--) {
    if (value === undefined) {
      out[a[i]] = val;
    }
    else {
      out[a[i]] = {...value};
    }
    value = out;
    out = {}
  }
  return value;
}

Blockly.Python['netpie_connect'] = function(block) {
    Blockly.Python.definitions_['microgear'] = 'from microgear import Microgear\nimport time\n';
    let device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC) || '';
    let device_token = Blockly.Python.valueToCode(block, 'device_token', Blockly.Python.ORDER_ATOMIC) || '';
    let sub_private_msg = block.getFieldValue('sub_private_msg').toLowerCase() == 'true';
    let sub_shadow_updated = block.getFieldValue('sub_shadow_updated').toLowerCase() == 'true';

    let code = `microgear = Microgear(${device_id}, ${device_token})\n`;
    if (sub_private_msg) code += `microgear.subscribe('@private/#')\n`;
    if (sub_shadow_updated) code += `microgear.subscribe('@shadow/data/updated')\n`;
    code += `microgear.connect()\n`;

    return code;
};

Blockly.Python['netpie_publish'] = function(block) {
    let subtopic = block.getFieldValue('topic');
    let topic = `'@msg/${subtopic}'`;
    let payload = Blockly.Python.valueToCode(block, 'payload', Blockly.Python.ORDER_ATOMIC) || '';
    let code = `microgear.publish(${topic},${payload})\n`
    return code;
};

Blockly.Python['netpie_on_connected'] = function(block) {
  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_on_connected_'+(cb_netpie_on_connected_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
    statements_callback]);

  let code = `microgear.on('Connected', ${functionName})\n`;
  return code;
};

Blockly.Python['netpie_on_disconnected'] = function(block) {
  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_on_disconnected_'+(cb_netpie_on_disconnected_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
    statements_callback]);

  let code = `microgear.on('Disconnected', ${functionName})\n`;
  return code;
};

Blockly.Python['netpie_subscribe'] = function(block) {
    let subtopic = block.getFieldValue('topic');
    let topic = `'@msg/${subtopic}'`;
    let code = `microgear.subscribe(${topic})\n`
    return code;
};


Blockly.Python['netpie_on_reveived_msg'] = function(block) {
  let subtopic = block.getFieldValue('topic');
  let topic = `'@msg/${subtopic}'`;

  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_on_reveived_msg_'+(cb_netpie_on_reveived_msg_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(topic, payload):',
    statements_callback]);

  let code = `microgear.on(${topic}, ${functionName})\n`;
  return code;
};


Blockly.Python['netpie_msg_payload'] = function(block) {
  let datatype = block.getFieldValue('datatype');


  let code;
  switch (datatype) {
    case 'string' :
            code = `str(payload)`;
            break;
    case 'int' :
            code = `int(payload)`;
            break;
    case 'float' :
            code = `float(payload)`;
            break;
    case 'bool' :
            code = `bool(payload)`;
            break;
  }
  return [code, Blockly.Python.ORDER_NONE]; 
};


Blockly.Python['netpie_write_shadow_field'] = function(block) {
    let field = Blockly.Python.valueToCode(block, 'field', Blockly.Python.ORDER_ATOMIC) || '';
    let value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC) || '';
    let code = `microgear.writeShadowField(${field}, ${value})\n`;
    return code;
};


Blockly.Python['netpie_read_shadow'] = function(block) {
  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_read_shadow_'+(cb_netpie_read_shadow_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(shadow):',
    statements_callback]);

  let code = `microgear.getShadowData(${functionName})\n`;
  return code;
};


Blockly.Python['netpie_on_shadow_updated'] = function(block) {
  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_on_shadow_updated_'+(cb_netpie_on_shadow_updated_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(shadow):',
    statements_callback]);

  let code = `microgear.on('ShadowUpdated', ${functionName})\n`;
  return code;
};


Blockly.Python['netpie_shadow_field'] = function(block) {
  let field = Blockly.Python.valueToCode(block, 'field', Blockly.Python.ORDER_ATOMIC) || '';
  let datatype = block.getFieldValue('datatype');
  let code;

  let obj = 'shadow'+objectDotToBracket(field.replace(/'/g,""));
  switch (datatype) {
    case 'string' :
            code = `str(${obj})`;
            break;
    case 'int' :
            code = `int(${obj})`;
            break;
    case 'float' :
            code = `float(${obj})`;
            break;
  }
  return [code, Blockly.Python.ORDER_NONE]; 
};


Blockly.Python['netpie_on_reveived_private_msg'] = function(block) {
  let subtopic = block.getFieldValue('topic');
  let topic = `'@private/${subtopic}'`;

  let statements_callback = Blockly.Python.statementToCode(block, 'callback') + '  pass';
  let functionName = Blockly.Python.provideFunction_(
    'cb_netpie_on_reveived_msg_'+(cb_netpie_on_reveived_msg_count++),
    ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(topic, payload):',
    statements_callback]);

  let code = `microgear.on(${topic}, ${functionName})\n`;
  return code;
};


Blockly.Python['netpie_private_msg_payload'] = function(block) {
  let datatype = block.getFieldValue('datatype');

  let code;
  switch (datatype) {
    case 'string' :
            code = `str(payload)`;
            break;
    case 'int' :
            code = `int(payload)`;
            break;
    case 'float' :
            code = `float(payload)`;
            break;
  }
  return [code, Blockly.Python.ORDER_NONE]; 
};


Blockly.Python['netpie_text'] = function(block) {
  let value = block.getFieldValue('value');
  let code = `"${String(value)}"`;
  return [code, Blockly.Python.ORDER_NONE]; 
};

Blockly.Python['netpie_number'] = function(block) {
  let value = block.getFieldValue('value');
  let code = `${value}`;
  return [code, Blockly.Python.ORDER_NONE]; 
};

Blockly.Python['netpie_boolean'] = function(block) {
  let value = block.getFieldValue('value');
  let code = `${value}`;
  return [code, Blockly.Python.ORDER_NONE]; 
};