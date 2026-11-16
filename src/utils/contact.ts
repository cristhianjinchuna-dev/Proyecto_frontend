// Links to talk with the other party of a confirmed reservation

// "987654321" -> "987 654 321"
export function formatPhone(phone: string): string {
  return phone.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
}

// WhatsApp needs the country code (+51 Peru) and no symbols
export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildPhoneLink(phone: string): string {
  return `tel:+51${phone}`;
}

export function buildContactMessage(contactName: string, reservationId: number, address?: string): string {
  const firstName = contactName.trim().split(/\s+/)[0] ?? contactName;
  const room = address ? ` de la habitación en ${address}` : '';
  return `Hola ${firstName}, te escribo desde MuvU por la reserva #${reservationId}${room}.`;
}
