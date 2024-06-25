import { reactive, ref, unref, type Ref } from 'vue'

export type RefStateType = {
    ref: Ref,
    options: {
        id: string,
        open: Function,
        close: Function,
    }
}

const references = reactive([]) as RefStateType[]

export const useStates = () => {
    return {
        stateList: () => unref(references),
        addState: (args: RefStateType) => {
            if (!references.length) {
                references.push(args)
                return true
            }

            const data = references.find(i => i && (i.options.id === args.options.id))
            if (!data) references.push(args)
        },
        removeState: (id: string) => {
            const dataIdx = references.findIndex(i => i && i.options.id === id)
            if (dataIdx === -1) return

            references[dataIdx]?.options.close()
            delete references[dataIdx]
        },
    }
}
