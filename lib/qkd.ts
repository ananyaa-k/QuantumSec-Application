// Simplified implementation of BB84 Quantum Key Distribution protocol
// Note: This is a simulation for demonstration purposes

export type Basis = "rectilinear" | "diagonal"
export type Bit = 0 | 1
export type QubitState = {
  bit: Bit
  basis: Basis
}

export class QKD {
  // Generate random bits
  static generateRandomBits(length: number): Bit[] {
    return Array.from({ length }, () => (Math.random() < 0.5 ? 0 : 1))
  }

  // Generate random bases
  static generateRandomBases(length: number): Basis[] {
    return Array.from({ length }, () => (Math.random() < 0.5 ? "rectilinear" : "diagonal"))
  }

  // Prepare qubits based on bits and bases
  static prepareQubits(bits: Bit[], bases: Basis[]): QubitState[] {
    return bits.map((bit, i) => ({
      bit,
      basis: bases[i],
    }))
  }

  // Measure qubits with given bases
  static measureQubits(qubits: QubitState[], measuringBases: Basis[]): Bit[] {
    return qubits.map((qubit, i) => {
      // If measuring basis matches preparation basis, result is deterministic
      if (qubit.basis === measuringBases[i]) {
        return qubit.bit
      }
      // If bases don't match, result is random
      return Math.random() < 0.5 ? 0 : 1
    })
  }

  // Compare bases and keep only matching positions
  static compareBases(aliceBases: Basis[], bobBases: Basis[]): number[] {
    return aliceBases.map((basis, i) => (basis === bobBases[i] ? i : -1)).filter((i) => i !== -1)
  }

  // Extract key from bits using matching positions
  static extractKey(bits: Bit[], matchingPositions: number[]): Bit[] {
    return matchingPositions.map((pos) => bits[pos])
  }

  // Convert bit array to hex string
  static bitsToHex(bits: Bit[]): string {
    let hex = ""
    for (let i = 0; i < bits.length; i += 4) {
      const chunk = bits.slice(i, i + 4)
      const decimal = chunk.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 3 - idx), 0)
      hex += decimal.toString(16)
    }
    return hex
  }

  // Generate a shared key between two parties
  static generateSharedKey(length = 256): {
    aliceKey: string
    bobKey: string
    matchRate: number
  } {
    // Step 1: Alice generates random bits and bases
    const aliceBits = this.generateRandomBits(length)
    const aliceBases = this.generateRandomBases(length)

    // Step 2: Alice prepares qubits
    const qubits = this.prepareQubits(aliceBits, aliceBases)

    // Step 3: Bob chooses random bases for measurement
    const bobBases = this.generateRandomBases(length)

    // Step 4: Bob measures qubits
    const bobBits = this.measureQubits(qubits, bobBases)

    // Step 5: Alice and Bob compare bases
    const matchingPositions = this.compareBases(aliceBases, bobBases)

    // Step 6: Extract key from matching positions
    const aliceKey = this.extractKey(aliceBits, matchingPositions)
    const bobKey = this.extractKey(bobBits, matchingPositions)

    // Calculate match rate
    const matchRate = matchingPositions.length / length

    // Convert to hex strings
    return {
      aliceKey: this.bitsToHex(aliceKey),
      bobKey: this.bitsToHex(bobKey),
      matchRate,
    }
  }

  // Encrypt a message using AES-GCM with the QKD key
  static async encryptMessage(message: string, key: string): Promise<string> {
    // In a real implementation, this would use the Web Crypto API with AES-GCM
    // This is a simplified version for demonstration
    const encoder = new TextEncoder()
    const data = encoder.encode(message)

    // Simple XOR encryption for demonstration
    const keyBytes = key.split("").map((c) => c.charCodeAt(0))
    const encrypted = Array.from(data).map((byte, i) => byte ^ keyBytes[i % keyBytes.length])

    return btoa(String.fromCharCode(...encrypted))
  }

  // Decrypt a message using AES-GCM with the QKD key
  static async decryptMessage(encryptedMessage: string, key: string): Promise<string> {
    // In a real implementation, this would use the Web Crypto API with AES-GCM
    // This is a simplified version for demonstration
    const encrypted = Uint8Array.from(
      atob(encryptedMessage)
        .split("")
        .map((c) => c.charCodeAt(0)),
    )

    // Simple XOR decryption for demonstration
    const keyBytes = key.split("").map((c) => c.charCodeAt(0))
    const decrypted = Array.from(encrypted).map((byte, i) => byte ^ keyBytes[i % keyBytes.length])

    const decoder = new TextDecoder()
    return decoder.decode(new Uint8Array(decrypted))
  }
}
