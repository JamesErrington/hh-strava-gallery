module.exports = (config, env) => {
  config.externals = {
    "react": "React",
    "react-dom": "ReactDOM",
    "react-dom/server": "ReactDOM",
    "firebase/app": "firebase",
    "firebase/auth": "firebase",
    "firebase/firestore": "firebase",
    "firebase/functions": "firebase",
    "firebase/storage": "firebase",
    "semantic-ui-react": "semanticUIReact",
    "react-router-dom": "ReactRouterDOM",
  }
  return config
}