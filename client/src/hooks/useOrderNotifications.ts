import { useEffect, useRef } from 'react';
import { store } from '@/lib/store';
import { toast } from 'sonner';

export function useOrderNotifications() {
  const lastOrderCountRef = useRef(0);

  useEffect(() => {
    // Initialize with current order count
    const initialOrders = store.getOrders();
    lastOrderCountRef.current = initialOrders.filter(
      (order) => order.status === 'new'
    ).length;

    // Check for new orders every 2 seconds
    const interval = setInterval(() => {
      const allOrders = store.getOrders();
      const newOrders = allOrders.filter((order) => order.status === 'new');
      const currentNewCount = newOrders.length;

      // If there are more new orders than before, show notification
      if (currentNewCount > lastOrderCountRef.current) {
        const newOrdersCount = currentNewCount - lastOrderCountRef.current;
        
        // Show toast notification
        toast.success(
          `🆕 ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`,
          {
            duration: 5000,
            description: `${newOrdersCount === 1 ? 'Order' : 'Orders'} waiting in the kitchen`,
          }
        );

        // Play notification sound
        playNotificationSound();
      }

      lastOrderCountRef.current = currentNewCount;
    }, 2000);

    return () => clearInterval(interval);
  }, []);
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create two beeps for notification
    const now = audioContext.currentTime;
    
    // First beep
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 800;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second beep
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1000;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Silently fail if audio context is not available
  }
}
