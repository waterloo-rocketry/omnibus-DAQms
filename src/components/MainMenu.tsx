import { Ellipsis, Plus, SquareDashedMousePointer, Trash2 } from 'lucide-react'
import { useState } from 'react'

<div className="sticky bottom-6 right-6">
    <button className="bg-grey-050 hover:bg-grey-100">
        <Ellipsis/>
    </button>
</div>

const [isOpen, setIsOpen] = useState<boolean>(false);
