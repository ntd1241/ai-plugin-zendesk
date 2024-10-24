//We handle prompt inside this file, so exported functions take no paramater

import { getTicket } from '@/app/api/zendesk.api'

export interface ResponseReturnProps {
  success: boolean
  errorMsg?: string
  response?: Response
}

export async function DraftResponse(): Promise<ResponseReturnProps> {
  try {
    const ticket = await getTicket()
    const response = await fetch('http://localhost:3500/draft-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticket)
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return {
      success: true,
      response: response
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    }
  }
}

export async function CorrectSpelling(): Promise<ResponseReturnProps> {
  try {
    const response = await fetch('http://localhost:3500/enhance-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'Correct' })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return {
      success: true,
      response: response
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    }
  }
}

export async function ShortenResponse(): Promise<ResponseReturnProps> {
  try {
    const response = await fetch('http://localhost:3500/enhance-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'Shorten' })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return {
      success: true,
      response: response
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    }
  }
}

export async function LengthenResponse(): Promise<ResponseReturnProps> {
  try {
    const response = await fetch('http://localhost:3500/enhance-response-wrongggg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'Lengthen' })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return {
      success: true,
      response: response
    }
  } catch (error) {
    return {
      success: false,
      errorMsg: (error as Error).message
    }
  }
}
