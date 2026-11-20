#!/usr/bin/env python3
# folha única: quadro do meio de cada plano (de storyboard/cNN.jpg). uso: folha_ep.py <proj> [cols]  -> <proj>/folha.jpg
import sys,glob
from PIL import Image
p=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 7
fs=sorted(glob.glob(p+'/storyboard/c*.jpg')); ims=[]
for f in fs:
    im=Image.open(f); w=im.width//3; ims.append(im.crop((w,0,2*w,im.height)).resize((200,356)))
rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(200*cols,356*rows),'white')
for i,im in enumerate(ims): S.paste(im,((i%cols)*200,(i//cols)*356))
S.save(p+'/folha.jpg',quality=85); print(len(ims))
