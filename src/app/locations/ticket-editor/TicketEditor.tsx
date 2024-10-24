import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useClient } from '../../hooks/useClient'
import { Button } from '@primitives/button'
import { Separator } from '@primitives/separator'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTextSpellcheck,
  IconTextDecrease,
  IconTextIncrease,
  IconRefresh,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import UseAnimations from 'react-useanimations'
import loading from 'react-useanimations/lib/loading'
import { DraftResponse, CorrectSpelling, ShortenResponse, LengthenResponse, ResponseReturnProps } from './actions'
import useUndo from 'use-undo'

interface ActionProps {
  action: () => Promise<ResponseReturnProps>
  title: string
  onWorking: string
  onSuccess: string
  onFailed: string
}

const ACTIONS = {
  'draft-response': {
    action: () => DraftResponse(),
    title: 'Draft response',
    onWorking: 'Drafting response',
    onSuccess: 'Response drafted successfully',
    onFailed: 'Failed to draft response'
  },
  'correct-spelling': {
    action: () => CorrectSpelling(),
    title: 'Correct spelling',
    onWorking: 'Correcting spelling',
    onSuccess: 'Response spelling corrected successfully',
    onFailed: 'Failed to correct spelling'
  },
  'shorten-response': {
    action: () => ShortenResponse(),
    title: 'Shorten response',
    onWorking: 'Shortening response',
    onSuccess: 'Response shortened successfully',
    onFailed: 'Failed to shorten response'
  },
  'lengthen-response': {
    action: () => LengthenResponse(),
    title: 'Lengthen response',
    onWorking: 'Lengthening response',
    onSuccess: 'Response lengthened successfully',
    onFailed: 'Failed to lengthen response'
  }
}

interface ActionProcessingProps {
  action: ActionProps
  result?: ResponseReturnProps
}

function ActionProcessing({ action, result }: ActionProcessingProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<React.ReactNode>()
  const client: any = useClient()

  useEffect(() => {
    if (result == null) {
      setTitle(action.onWorking)
      setDescription('This may take a few seconds.')
      setIcon(<UseAnimations animation={loading} size={24} fillColor="#64748B" />)
    } else {
      if (result?.success) {
        setTitle(action.onSuccess)
        setDescription('')
        setIcon(<IconCheck className="text-jarvis-5" />)
      } else {
        client.set('comment.text', 'Error')
        setTitle(action.onFailed)
        setDescription(result.errorMsg ?? '')
        setIcon(<IconX className="text-failed" />)
      }
    }
  }, [result])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row px-2 py-1.5 place-items-center">
        <div className="px-2 py-1.5 flex-1">
          <div className="menu-title text-jarvis-5">Response Toolbox</div>
        </div>
      </div>
      <Separator />
      <div className="flex flex-row px-4 py-3 space-x-4 place-items-center">
        {icon}
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="detail">{description}</span>
        </div>
      </div>
    </div>
  )
}

interface MenuProps {
  onClick: (actionProps: ActionProps) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

function Menu(props: MenuProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row px-2 py-1.5 place-items-center">
        <div className="px-2 py-1.5 flex-1">
          <div className="menu-title text-jarvis-5">Response Toolbox</div>
        </div>
        <div className="space-x-1">
          <Button variant={'outline'} size={'icon'} disabled={props.canUndo ? false : true} onClick={props.onUndo}>
            <IconArrowBackUp className="size-4 text-jarvis-5" />
          </Button>
          <Button variant={'outline'} size={'icon'} disabled={props.canRedo ? false : true} onClick={props.onRedo}>
            <IconArrowForwardUp className="size-4 text-jarvis-5" />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col px-2 py-1.5">
        <div className="px-2 py-1.5">
          <div className="menu-section">Formalization</div>
        </div>
        {/* forEach */}
        <Button variant={'ghost'} onClick={() => props.onClick(ACTIONS['correct-spelling'])}>
          <div className="flex flex-row w-full place-items-center">
            <IconTextSpellcheck className="size-4 mr-2 text-jarvis-5" /> {ACTIONS['correct-spelling'].title}
          </div>
        </Button>
        <Button variant={'ghost'} onClick={() => props.onClick(ACTIONS['shorten-response'])}>
          <div className="flex flex-row w-full place-items-center">
            <IconTextDecrease className="size-4 mr-2 text-jarvis-5" /> {ACTIONS['shorten-response'].title}
          </div>
        </Button>
        <Button variant={'ghost'} onClick={() => props.onClick(ACTIONS['lengthen-response'])}>
          <div className="flex flex-row w-full place-items-center">
            <IconTextIncrease className="size-4 mr-2 text-jarvis-5" /> {ACTIONS['lengthen-response'].title}
          </div>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col px-2 py-1.5">
        <Button variant={'primary'} onClick={() => props.onClick(ACTIONS['draft-response'])}>
          <div className="flex flex-row w-full place-items-center">
            <IconRefresh className="size-4 mr-2" /> {ACTIONS['draft-response'].title}
          </div>
        </Button>
      </div>
    </div>
  )
}

const TicketEditor = () => {
  const client: any = useClient()
  useEffect(() => {
    client.invoke('resize', { width: '248px' })
  }, [client])

  const [menuState, setMenuState] = useState('menu')
  const [height, setHeight] = useState(240)
  const ref = useRef<HTMLDivElement>(null)
  const [
    currentResponse,
    { set: setCurrentResponse, undo: undoResponse, redo: redoResponse, reset: resetResponse, canUndo, canRedo }
  ] = useUndo<string>('')

  let messageDraftTimeout: any

  //Update Zendesk Ticket Editor height
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect) {
        const newHeight = entries[0].contentRect.height
        setHeight(newHeight)
        client.invoke('resize', { height: newHeight })
      }
    })

    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    // Clean up observer on component unmount
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current)
      }
    }
  }, [client, menuState]) // Re-observe on menuState change

  const [activeAction, setActiveAction] = useState(ACTIONS['draft-response'])
  const [result, setResult] = useState<ResponseReturnProps>()

  const OnActionClick = async (action: ActionProps) => {
    client.set('comment.text', 'Generating...')
    setMenuState('loading')
    setActiveAction(action)
    setResult(undefined)
    const actionResult = await action.action()
    if (actionResult?.success) await streamHandler(actionResult.response)
    setResult(actionResult)

    setTimeout(() => {
      setMenuState('menu')
    }, 2000)
  }

  // Handler for stream response
  const streamHandler = async (res: Response | undefined) => {
    if (!res) {
      return
    }

    const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader()
    let fullResponse = ''

    if (reader) {
      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          setCurrentResponse(fullResponse)
          break
        }

        fullResponse += value.replace('data: ', '').trim() + ' '
        client.set('comment.text', fullResponse)
      }
    }
  }

  // Auto draft when open ticket
  useEffect(() => {
    const initDraftTicket = async () => {
      const currentComment = (await client.get('ticket.comment'))['ticket.comment'].text
      resetResponse(currentComment)

      if (currentComment !== '') {
        return
      }

      OnActionClick(ACTIONS['draft-response'])
    }

    initDraftTicket()
  }, [])

  const handleNewCustomerMessageDraft = async () => {
    const ticket = (await client.get('ticket')).ticket
    if (ticket?.conversation?.pop().author?.role !== 'end-user') {
      return
    }

    if (ticket?.comment.text.trim() !== '') {
      return
    }

    if (messageDraftTimeout) {
      clearTimeout(messageDraftTimeout)
    }

    client.set('comment.text', 'Waiting for more messages...')

    messageDraftTimeout = setTimeout(() => {
      OnActionClick(ACTIONS['draft-response'])
    }, 5000)
  }

  // Register event to draft response when new end-user's comment send
  useEffect(() => {
    const register = async () => {
      const ticket = (await client.get('ticket')).ticket

      if (ticket?.via.channel == 'native_messaging' || ticket?.via.channel == 'sample_ticket') {
        client.on('ticket.conversation.changed', async () => {
          handleNewCustomerMessageDraft()
        })
      }
    }

    register()
  }, [])

  // Undo and Redo event
  const onUndoResponse = () => {
    if (canUndo) {
      client.set('comment.text', currentResponse.past[currentResponse.past.length - 1])
      undoResponse()
    }
  }

  const onRedoResponse = () => {
    if (canRedo) {
      client.set('comment.text', currentResponse.future[0])
      redoResponse()
    }
  }

  return (
    <div ref={ref}>
      {menuState == 'menu' && (
        <Menu
          onClick={(action) => OnActionClick(action)}
          onRedo={onRedoResponse}
          onUndo={onUndoResponse}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}
      {menuState == 'loading' && <ActionProcessing action={activeAction} result={result} />}
    </div>
  )
}

export default TicketEditor
