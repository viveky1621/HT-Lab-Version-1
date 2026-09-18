
import streamlit as st

# 1. Industrial Laboratory Configuration
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. Advanced CSS to make the laboratory full-screen
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; overflow: hidden; }
    /* Ensure the iframe fills the entire Streamlit container */
    iframe {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        border: none !important;
        margin: 0;
        padding: 0;
        background: #0f172a;
    }
    </style>
""", unsafe_allow_html=True)

# 3. Serving the Laboratory Rig
# We use the built-in static serving mechanism defined in .streamlit/config.toml
# On Streamlit Cloud, assets in /static/ are served relative to the root URL
try:
    # We attempt to reach the static/index.html which contains the compiled React app
    st.components.v1.iframe("./static/index.html", height=1000)
except Exception as e:
    st.error("DCS Terminal Link Failure. Please ensure the laboratory system is fully deployed.")
    st.exception(e)

# 4. Fallback for Local Environments
st.markdown("""
    <div style="position: fixed; bottom: 10px; right: 10px; color: rgba(255,255,255,0.2); font-size: 8px; font-family: monospace;">
        THERMOLAB_OS v1.0.4_DEPLOY
    </div>
""", unsafe_allow_html=True)
