import { xai } from '@ai-sdk/xai';
import { stepCountIs } from 'ai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: xai('grok-3'),
    stopWhen: stepCountIs(5),
    tools: {
      calculator: ({
        description: "Perform calculation with two numbers",
        inputSchema: z.object({
          n1: z.number(),
          n2: z.number(),
          operation: z.enum(["SUM", "MULTIPLY", "DIVIDE", "MINUS"])
        }),
        execute: async input => {
          try {
            const { n1, n2, operation } = input;
            const result = performCalculation(n1, n2, operation);
            console.log({ result: `N1 + N2 = ${result}` })
            return { result: `N1 + N2 = ${result}` }
          } catch (error) {
            console.error(error)
          }
        }
      })
    },
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

enum Operation {
  SUM = 'SUM',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MINUS = 'MINUS'
}

const performCalculation = (n1: number, n2: number, operation: Operation) => {
  switch (operation) {
    case Operation.SUM:
      return n1 + n2;
    case Operation.MINUS:
      return n1 - n2;
    case Operation.MULTIPLY:
      return n1 * n2;
    case Operation.DIVIDE:
      return n1 / n2;
  }
}