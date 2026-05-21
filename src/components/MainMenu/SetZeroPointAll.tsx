import { Button } from '@/components/ui/button'
import { zeroPointRegistry } from '@/store/dashboardStore/ZeroPointRegistry'

export default function SetZeroPointAll() {
  return (
    <Button onClick={() => zeroPointRegistry.runAll()}>
      Set Zero Point (All Graphs)
    </Button>
  );
}