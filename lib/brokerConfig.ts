export interface BrokerFee {
  broker: string
  contractFee: number
  currency: string
}

export const BROKER_FEES: BrokerFee[] = [
  {
    broker: "Webull",
    contractFee: 0.99,
    currency: "USD"
  },
  {
    broker: "moomoo",
    contractFee: 0.65,
    currency: "USD"
  },
  {
    broker: "Interactive Brokers (US)",
    contractFee: 0.65,
    currency: "USD"
  },
  {
    broker: "Interactive Brokers (Canada)",
    contractFee: 1.25,
    currency: "CAD"
  },
  {
    broker: "Wealthsimple Core",
    contractFee: 2.00,
    currency: "CAD"
  },
  {
    broker: "Wealthsimple Premium",
    contractFee: 0.75,
    currency: "CAD"
  },
  {
    broker: "Questrade",
    contractFee: 0.99,
    currency: "USD"
  }
]

export function getBrokerOptions(): string[] {
  return Array.from(new Set(BROKER_FEES.map(fee => fee.broker)))
}

export function getBrokerFees(broker: string): BrokerFee | null {
  return BROKER_FEES.find(f => f.broker === broker) || null
}
