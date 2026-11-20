import numpy as np, wave
SR=44100
def save(n,x):
    x=x/max(1e-9,np.abs(x).max())*0.9
    w=wave.open(f"{__file__.rsplit('/',1)[0]}/{n}.wav","wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((x*32767).astype('<i2').tobytes());w.close()
t=np.arange(int(SR*0.9))/SR
f=140*np.exp(-t*5)+38; ph=2*np.pi*np.cumsum(f)/SR
boom=np.sin(ph)*np.exp(-t*4.2)+0.35*np.random.RandomState(1).randn(len(t))*np.exp(-t*30)
save("boom",boom)
t=np.arange(int(SR*0.18))/SR
save("pop",np.sin(2*np.pi*(500+2500*t)*t)*np.exp(-t*22))
t=np.arange(int(SR*0.7))/SR
save("ding",(np.sin(2*np.pi*1318*t)+0.5*np.sin(2*np.pi*1976*t))*np.exp(-t*7))
t=np.arange(int(SR*0.9))/SR
save("riser",np.sin(2*np.pi*(200+900*t**2)*t)*t**1.5*np.exp(-((t-0.9)**2)*0))
