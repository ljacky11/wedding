#!/usr/bin/env python3
"""產生婚禮 App 圖示（純標準函式庫，無需安裝套件）。
畫面：玫瑰粉背景 + 中央白色愛心。輸出 192、512 與 maskable 512。"""
import struct, zlib, os, math

ROSE = (201, 139, 139)      # #c98b8b
CREAM = (250, 246, 242)     # 白色愛心用近白
WHITE = (255, 255, 255)


def heart_inside(px, py, cx, cy, scale):
    """判斷點 (px,py) 是否在以 (cx,cy) 為中心、大小 scale 的愛心內。"""
    x = (px - cx) / scale
    y = -(py - cy) / scale
    # 經典愛心隱函式：(x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    a = x * x + y * y - 1
    return a * a * a - x * x * y * y * y <= 0


def make_png(size, maskable=False):
    # maskable：圖示內容需留安全邊界（縮小愛心）
    heart_scale = size * (0.30 if maskable else 0.34)
    cx, cy = size / 2, size * 0.47
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type 0
        for x in range(size):
            if heart_inside(x, y, cx, cy, heart_scale):
                r, g, b = WHITE
            else:
                r, g, b = ROSE
            raw.extend((r, g, b))
    return _encode_png(size, size, bytes(raw))


def _encode_png(w, h, raw_rgb):
    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit, RGB
    idat = zlib.compress(raw_rgb, 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


def main():
    os.makedirs("icons", exist_ok=True)
    outputs = [
        ("icons/icon-192.png", 192, False),
        ("icons/icon-512.png", 512, False),
        ("icons/icon-maskable-512.png", 512, True),
    ]
    for path, size, maskable in outputs:
        with open(path, "wb") as f:
            f.write(make_png(size, maskable))
        print("wrote", path)


if __name__ == "__main__":
    main()
