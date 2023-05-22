from machine import Pin, I2C
from os import uname

machine = uname().machine
if ("KidBright32" in machine) or ("KidMotor V4" in machine):
    i2c1 = I2C(1, scl=Pin(5), sda=Pin(4), freq=400000)
elif "Mbits" in machine:
    i2c1 = I2C(0, scl=Pin(21), sda=Pin(22), freq=400000)
else:
    i2c1 = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)

ADDR = 0x40

t_min = [ 0.5 ] * 16
t_max = [ 2.5 ] * 16

# Set Clock
_oscillator_freq = 27000000
freq = 50
prescaleval = ((_oscillator_freq / (freq * 4096.0)) + 0.5) - 1.0
i2c1.writeto_mem(ADDR, 0xFE, bytes([ int(prescaleval) ]))

# Reset
i2c1.writeto_mem(ADDR, 0x00, bytes([ 0b10100000 ])) # RESTART triger, Auto-Increment register

def setAngle(n, angle):
	if n > 15:
		return

	angle = min(angle, 200)

	angleToMS = (angle * (t_max[n] -  t_min[n]) / 200.0) + t_min[n]
	pulse_u16 = int((angleToMS * 4095.0 / 20.0) * 0.93)

	i2c1.writeto_mem(ADDR, 0x06 + (n * 4), bytes([
		0, # ON LSB
		0, # ON MSB
		pulse_u16 & 0xFF,
		(pulse_u16 >> 8) & 0xFF
	]))

def calibrate(n, min, max):
	t_min[n] = min
	t_max[n] = max
