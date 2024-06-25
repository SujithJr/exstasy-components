let id = 0
const generateId = () => ++id

export const useId = () => generateId()
