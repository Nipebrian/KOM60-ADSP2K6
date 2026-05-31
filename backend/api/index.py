import sys
import os

# Tambahkan direktori backend/ ke Python path agar package 'app' bisa ditemukan
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
