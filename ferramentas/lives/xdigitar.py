#!/usr/bin/env python3
"""Seletor de arquivo nativo (GTK) do Chrome: ctrl+L, digita o caminho, Enter. Uso: xdigitar.py /caminho/arquivo"""
import sys, time
from Xlib import X, XK, display
from Xlib.ext import xtest
d = display.Display()

def key(sym, shift=False, ctrl=False):
    kc = d.keysym_to_keycode(XK.string_to_keysym(sym) if isinstance(sym, str) else sym)
    for m, k in ((ctrl, "Control_L"), (shift, "Shift_L")):
        if m:
            xtest.fake_input(d, X.KeyPress, d.keysym_to_keycode(XK.string_to_keysym(k)))
    xtest.fake_input(d, X.KeyPress, kc); xtest.fake_input(d, X.KeyRelease, kc)
    for m, k in ((shift, "Shift_L"), (ctrl, "Control_L")):
        if m:
            xtest.fake_input(d, X.KeyRelease, d.keysym_to_keycode(XK.string_to_keysym(k)))
    d.sync(); time.sleep(0.03)

NOMES = {" ": "space", "/": "slash", ".": "period", "-": "minus", "_": "underscore", "(": "parenleft", ")": "parenright"}
def digitar(s):
    for ch in s:
        shift = ch.isupper() or ch in "_()"
        key(NOMES.get(ch, ch.lower() if ch.isupper() else ch), shift=shift)

if __name__ == "__main__":
    time.sleep(1.0)
    key("l", ctrl=True); time.sleep(0.4)
    digitar(sys.argv[1]); time.sleep(0.4)
    key("Return"); d.sync()
