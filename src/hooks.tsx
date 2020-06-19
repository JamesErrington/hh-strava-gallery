import React, { createContext, useContext } from "react"
import type { FunctionComponent } from "react"

import Firebase from "./firebase"

const FirebaseContext = createContext<Firebase | undefined>(undefined)

const FirebaseProvider: FunctionComponent = ({ children }) => (
  <FirebaseContext.Provider value={new Firebase()}>
    {children}
  </FirebaseContext.Provider>
)

function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be inside a FirebaseProvider")
  }
  return context
}

export { FirebaseProvider, useFirebase }