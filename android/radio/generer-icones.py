from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os, sys
GOLD=(232,190,70); GOLD2=(247,214,110); NAVY=(14,24,48); NAVY2=(29,48,92)
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def bg(W,H):
    im=Image.new('RGB',(W,H),NAVY); px=im.load()
    cx,cy=W/2,H*0.42; R=math.hypot(W,H)*0.6
    for y in range(H):
        for x in range(W):
            t=min(1,math.hypot(x-cx,y-cy)/R)
            px[x,y]=tuple(int(NAVY2[i]*(1-t)+NAVY[i]*t) for i in range(3))
    return im
def text_c(d,cx,cy,s,size,fill,spacing=0):
    f=ImageFont.truetype(B,size)
    if spacing:
        ws=[d.textbbox((0,0),c,font=f)[2] for c in s]; tot=sum(ws)+spacing*(len(s)-1); x=cx-tot/2
        for c,w in zip(s,ws):
            d.text((x,cy),c,font=f,fill=fill,anchor='lm'); x+=w+spacing
    else: d.text((cx,cy),s,font=f,fill=fill,anchor='mm')
def mark(layer,cx,cy,D):
    d=ImageDraw.Draw(layer); r=D/2; w=max(2,int(D*0.035))
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=GOLD,width=w)
    # antenna + waves
    ay=cy-r*0.42; dot=D*0.035
    d.ellipse([cx-dot,ay-dot,cx+dot,ay+dot],fill=GOLD2)
    for k,rr in enumerate([0.11,0.19]):
        R=D*rr; ww=max(2,int(D*0.026))
        d.arc([cx-R,ay-R,cx+R,ay+R],205,335,fill=GOLD,width=ww)
    text_c(d,cx,cy+D*0.04,'KCC',int(D*0.30),GOLD)
    text_c(d,cx,cy+D*0.27,'RADIO',int(D*0.105),GOLD2,spacing=int(D*0.02))
def legacy(S,round_=False):
    k=4; W=S*k; im=bg(W//4,W//4).resize((W,W)); 
    mark(im,W/2,W/2,W*0.80)
    im=im.resize((S,S),Image.LANCZOS)
    if round_:
        m=Image.new('L',(S*4,S*4),0); ImageDraw.Draw(m).ellipse([0,0,S*4-1,S*4-1],fill=255); m=m.resize((S,S),Image.LANCZOS)
        o=Image.new('RGBA',(S,S),(0,0,0,0)); o.paste(im,(0,0),m); return o
    return im
def fg(S):
    W=S*4; im=Image.new('RGBA',(W,W),(0,0,0,0)); mark(im,W/2,W/2,W*62/108); return im.resize((S,S),Image.LANCZOS)
out=sys.argv[1]; res=os.path.join(out,'res')
for name,s in dict(mdpi=48,hdpi=72,xhdpi=96,xxhdpi=144,xxxhdpi=192).items():
    p=os.path.join(res,'mipmap-'+name); os.makedirs(p,exist_ok=True)
    legacy(s).save(p+'/ic_launcher.png'); legacy(s,True).save(p+'/ic_launcher_round.png')
    fg(int(s*108/48)).save(p+'/ic_launcher_foreground.png')
store=os.path.join(out,'store'); os.makedirs(store,exist_ok=True)
legacy(512).save(store+'/icone-512.png')
legacy(192,True).save(store+'/icon-192-rond.png')
# feature graphic 1024x500 (rendu x2)
k=2; W,H=1024*k,500*k; im=bg(W//4,H//4).resize((W,H))
mark(im,250*k,250*k,330*k); d=ImageDraw.Draw(im)
f1=ImageFont.truetype(B,56*k); f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26*k)
d.text((470*k,165*k),'Radio',font=f1,fill=(255,255,255)); d.text((470*k,235*k),'Je suis KCCiste',font=f1,fill=GOLD)
d.text((472*k,325*k),'Chants, prédications et',font=f2,fill=(217,223,234))
d.text((472*k,362*k),'émissions en direct, 24 h/24',font=f2,fill=(217,223,234))
im.resize((1024,500),Image.LANCZOS).save(store+'/banniere-1024x500.png')
