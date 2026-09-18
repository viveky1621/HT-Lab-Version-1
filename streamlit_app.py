
import streamlit as st

# High-fidelity lab configuration
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Professional Industrial UI Injection
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; overflow: hidden; }
    iframe { border: none !important; width: 100%; height: 98vh; position: fixed; top: 0; left: 0; }
    </style>
""", unsafe_allow_html=True)

# Streamlit Cloud serves the 'static' folder at /app/static/ or /static/
# We use the component to embed the React build
try:
    st.components.v1.iframe("/static/index.html", height=1000)
except Exception as e:
    st.error("DCS Terminal Error: Static assets not reachable. Please refresh or reboot the instance.")
    st.code(str(e))
