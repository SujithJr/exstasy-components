import { reactive, unref, type Ref } from 'vue'

type RecordingsType = {
    id: string,
    content: HTMLElement | null
}

const recordings = reactive([]) as RecordingsType[]

export const useRecording = () => {
    return {
        recordingsList: () => unref(recordings),
        addRecord: (params: RecordingsType) => {
            const idx = recordings.findIndex(i => i.id === params.id)
            if (idx === -1) return recordings.push(params)

            recordings[idx].content = params.content
        },
        getRecord: (id: string) => {
            const idx = recordings.findIndex(i => i.id === id)
            if (idx === -1) return null
            return recordings[idx].content
        },
    }
}
