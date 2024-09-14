import { createContext, useRef } from 'react'

export const ScrollRefContext = createContext()

export const ScrollRefProvider = ({ children }) => {
  const refHeaderSection = useRef(null)
  const refPartnersSection = useRef(null)
  const refFunctionAppSection = useRef(null)
  const refPartner = useRef(null)
  const refFunctionApp = useRef(null)
  const filterPartnersRef = useRef(null)
  return (
    <ScrollRefContext.Provider
      value={{
        refHeaderSection,
        refPartnersSection,
        refFunctionAppSection,
        refPartner,
        refFunctionApp,
        filterPartnersRef
      }}
    >
      {children}
    </ScrollRefContext.Provider>
  )
}
