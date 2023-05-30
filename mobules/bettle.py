from machine import Pin, I2C
from os import uname



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
