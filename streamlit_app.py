import streamlit as st
import os

st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Strip ALL Streamlit chrome and padding
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container { padding: 0 !important; max-width: 100% !important; }
    .stApp { background-color: #0f172a; overflow: hidden; }
    div[data-testid="stVerticalBlock"] { gap: 0 !important; }
    iframe { border: none !important; display: block; }
    </style>
""", unsafe_allow_html=True)

PATCHED_PATH = os.path.join(os.getcwd(), "static", "index_patched.html")

if not os.path.exists(PATCHED_PATH):
    st.error("Build not found. Run: python3 patch_build.py")
else:
    with open(PATCHED_PATH, "r", encoding="utf-8") as f:
        html = f.read()
    st.components.v1.html(html, height=1050, scrolling=True)
