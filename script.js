class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.id = Date.now() + Math.random().toString(36).substr(2, 9); // Unique ID for DOM mapping
    }
}

// Sound Effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'warning') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
         gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'delete') {
        // Falling tone for deletion
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    
    // Check if value exists
    contains(data) {
        let current = this.head;
        while (current) {
            if (current.data === data) return true;
            current = current.next;
        }
        return false;
    }

    // Insert at start
    insertStart(data) {
        // Check for duplicate
        if (this.contains(data)) {
             return { success: false, message: `Value ${data} already exists in the list.`, type: 'warning' };
        }
        const newNode = new Node(data);
        newNode.next = this.head;
        this.head = newNode;
        return newNode;
    }

    // Insert at end
    insertEnd(data) {
        // Check for duplicate
        if (this.contains(data)) {
             return { success: false, message: `Value ${data} already exists in the list.`, type: 'warning' };
        }
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            return newNode;
        }

        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
        return newNode;
    }

    // Insert middle (before a value, matching C code logic closely)
    // C code logic: if head matches, insert before. Else traverse to find previous node whose next matches.
    insertMiddle(data, targetValue) {
        // Check for duplicate
        if (this.contains(data)) {
             return { success: false, message: `Value ${data} already exists in the list.`, type: 'warning' };
        }
        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
            return { success: true, node: newNode };
        }

        if (this.head.data == targetValue) {
            newNode.next = this.head;
            this.head = newNode;
            return { success: true, node: newNode };
        }

        let current = this.head;
        while (current.next && current.next.data != targetValue) {
            current = current.next;
        }

        if (!current.next) {
            return { success: false, message: `Target ${targetValue} not found.` };
        }

        newNode.next = current.next;
        current.next = newNode;
        return { success: true, node: newNode };
    }

    // Insert After (New Feature)
    insertAfter(data, targetValue) {
        // Check for duplicate
        if (this.contains(data)) {
             return { success: false, message: `Value ${data} already exists in the list.`, type: 'warning' };
        }
        const newNode = new Node(data);

        let current = this.head;
        while (current) {
            if (current.data == targetValue) {
                newNode.next = current.next;
                current.next = newNode;
                return { success: true, node: newNode };
            }
            current = current.next;
        }

        return { success: false, message: `Target ${targetValue} not found.` };
    }

    // Insert at Index (New Feature)
    insertAtIndex(data, index) {
        // Check for duplicate
        if (this.contains(data)) {
             return { success: false, message: `Value ${data} already exists in the list.`, type: 'warning' };
        }

        // 1-based indexing logic
        // Index 1 = start (formerly 0)
        // Adjust for internal 0-based logic
        const targetIndex = index - 1;

        if (targetIndex < 0) return { success: false, message: "Index must be 1 or greater." };
        
        const newNode = new Node(data);
        
        if (targetIndex === 0) {
            newNode.next = this.head;
            this.head = newNode;
            return { success: true, node: newNode };
        }

        let current = this.head;
        let count = 0;
        let previous = null;

        while (current && count < targetIndex) {
            previous = current;
            current = current.next;
            count++;
        }

        if (count === targetIndex) {
            previous.next = newNode;
            newNode.next = current;
            return { success: true, node: newNode };
        } else {
             return { success: false, message: `Index ${index} out of bounds.` };
        }
    }

    // Delete start
    deleteStart() {
        if (!this.head) return { success: false, message: "List is empty." };
        
        const removedNode = this.head;
        this.head = this.head.next;
        return { success: true, node: removedNode };
    }

    // Delete end
    deleteEnd() {
        if (!this.head) return { success: false, message: "List is empty." };
        
        if (!this.head.next) {
            const removedNode = this.head;
            this.head = null;
            return { success: true, node: removedNode };
        }

        let current = this.head;
        while (current.next.next) {
            current = current.next;
        }
        
        const removedNode = current.next;
        current.next = null;
        return { success: true, node: removedNode };
    }

    // Delete middle (by value)
    deleteMiddle(targetValue) {
        if (!this.head) return { success: false, message: "List is empty." };

        if (this.head.data == targetValue) {
            const removedNode = this.head;
            this.head = this.head.next;
            return { success: true, node: removedNode };
        }

        let current = this.head;
        while (current.next && current.next.data != targetValue) {
            current = current.next;
        }

        if (!current.next) {
            return { success: false, message: `Value ${targetValue} not found.` };
        }

        const removedNode = current.next;
        current.next = current.next.next;
        return { success: true, node: removedNode };
    }

    toArray() {
        const nodes = [];
        let current = this.head;
        while (current) {
            nodes.push(current);
            current = current.next;
        }
        return nodes;
    }
}

// UI Controller
const list = new LinkedList();
const container = document.getElementById('linked-list');
const messageArea = document.getElementById('message-area');

// Render Function
function renderList() {
    container.innerHTML = '';
    const nodes = list.toArray();

    if (nodes.length === 0) {
        container.innerHTML = '<div class="empty-state">List is empty</div>';
        return;
    }

    nodes.forEach((node, index) => {
        // Create Node Element
        const nodeWrapper = document.createElement('div');
        nodeWrapper.className = 'node-wrapper';
        nodeWrapper.id = `node-${node.id}`;

        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.textContent = node.data;
        nodeWrapper.appendChild(nodeEl);

        // Create Pointer (unless it's the last one)
        if (index < nodes.length - 1) {
            const pointer = document.createElement('div');
            pointer.className = 'pointer';
            nodeWrapper.appendChild(pointer);
        } else {
             // Null pointer for the last element (Hidden as per request)
             const nullPointer = document.createElement('div');
             nullPointer.className = 'null-pointer';
             nullPointer.textContent = 'NULL';
             nullPointer.style.display = 'none';
             nodeWrapper.appendChild(nullPointer);
        }

        container.appendChild(nodeWrapper);
    });
}

// Utility for messages
function showMessage(msg, type = 'success') {
    messageArea.textContent = msg;
    messageArea.className = `message-area message-${type}`;
    setTimeout(() => {
        messageArea.textContent = '';
        messageArea.className = 'message-area';
    }, 3000);
    
    // Play sound based on message type
    if (type === 'success') playSound('success');
    else if (type === 'error') playSound('error');
    else if (type === 'warning') playSound('warning');
    else if (type === 'delete') playSound('delete');
}

// Helper: Highlight Node
async function highlightNode(nodeId, type = 'highlight') {
    const el = document.getElementById(`node-${nodeId}`);
    if (el) {
        const circle = el.querySelector('.node');
        circle.classList.add(type);
        await new Promise(r => setTimeout(r, 500));
        circle.classList.remove(type);
    }
}

// Event Listeners

// Insert Start
document.getElementById('btn-insert-start').addEventListener('click', () => {
    const input = document.getElementById('insert-value');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        showMessage('Please enter a valid number', 'error');
        return;
    }

    const newNode = list.insertStart(value);
    
    if (newNode && newNode.success === false) {
         showMessage(newNode.message, newNode.type);
         return;
    }

    renderList();
    highlightNode(newNode.id);
    input.value = '';
    showMessage(`Inserted ${value} at start`);
});

// Insert End
document.getElementById('btn-insert-end').addEventListener('click', () => {
    const input = document.getElementById('insert-value');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        showMessage('Please enter a valid number', 'error');
        return;
    }

    const newNode = list.insertEnd(value);
    
    if (newNode && newNode.success === false) {
         showMessage(newNode.message, newNode.type);
         return;
    }

    renderList();
    highlightNode(newNode.id);
    input.value = '';
    showMessage(`Inserted ${value} at end`);
});

// Insert Middle
// Insert Before (Formerly Insert Middle)
document.getElementById('btn-insert-middle').addEventListener('click', () => {
    const valInput = document.getElementById('insert-index-value');
    const targetInput = document.getElementById('insert-index');
    
    const value = parseInt(valInput.value);
    const target = parseInt(targetInput.value);

    if (isNaN(value) || isNaN(target)) {
        showMessage('Please enter valid numbers', 'error');
        return;
    }

    const result = list.insertMiddle(value, target);
    
    if (result.success) {
        renderList();
        highlightNode(result.node.id);
        valInput.value = '';
        targetInput.value = ''; // Don't clear target if user wants to insert more
        showMessage(`Inserted ${value} before ${target}`);
    } else {
        const type = result.type || 'error';
        showMessage(result.message, type);
    }
});

// Insert After (New UI Handler)
document.getElementById('btn-insert-after').addEventListener('click', () => {
    const valInput = document.getElementById('insert-index-value');
    const targetInput = document.getElementById('insert-index');
    
    const value = parseInt(valInput.value);
    const target = parseInt(targetInput.value);

    if (isNaN(value) || isNaN(target)) {
        showMessage('Please enter valid numbers', 'error');
        return;
    }

    const result = list.insertAfter(value, target);
    
    if (result.success) {
        renderList();
        highlightNode(result.node.id);
        valInput.value = '';
        // targetInput.value = ''; // Keep target for convenience
        showMessage(`Inserted ${value} after ${target}`);
    } else {
        const type = result.type || 'error';
        showMessage(result.message, type);
    }
});

// Insert At Index (New UI Handler)
document.getElementById('btn-insert-at-index').addEventListener('click', () => {
    const valInput = document.getElementById('insert-at-index-value');
    const idxInput = document.getElementById('insert-at-index-idx');
    
    const value = parseInt(valInput.value);
    const index = parseInt(idxInput.value);

    if (isNaN(value) || isNaN(index)) {
        showMessage('Please enter valid numbers', 'error');
        return;
    }

    const result = list.insertAtIndex(value, index);
    
    if (result.success) {
        renderList();
        highlightNode(result.node.id);
        valInput.value = '';
        idxInput.value = '';
        showMessage(`Inserted ${value} at index ${index}`);
    } else {
        showMessage(result.message, result.type || 'error');
    }
});

// Delete Start
document.getElementById('btn-delete-start').addEventListener('click', async () => {
    if (!list.head) {
        showMessage('List is empty', 'error');
        return;
    }

    // Visual effect before delete
    await highlightNode(list.head.id, 'delete-highlight');
    
    const result = list.deleteStart();
    if (result.success) {
        renderList();
        showMessage(`Deleted start node (${result.node.data})`, 'delete');
    } else {
        showMessage(result.message, 'error');
    }
});

// Delete End
document.getElementById('btn-delete-end').addEventListener('click', async () => {
    if (!list.head) {
        showMessage('List is empty', 'error');
        return;
    }
    
    // Find last node to highlight
    let current = list.head;
    while(current.next) current = current.next;
    await highlightNode(current.id, 'delete-highlight');

    const result = list.deleteEnd();
    if (result.success) {
        renderList();
        showMessage(`Deleted end node (${result.node.data})`, 'delete');
    } else {
        showMessage(result.message, 'error');
    }
});

// Delete Middle
document.getElementById('btn-delete-middle').addEventListener('click', async () => {
    const input = document.getElementById('delete-value');
    const value = parseInt(input.value);

    if (isNaN(value)) {
        showMessage('Please enter a valid number to delete', 'error');
        return;
    }

    // Find node to highlight if exists
    let current = list.head;
    let found = false;
    while(current) {
        if(current.data === value) {
            found = true;
            await highlightNode(current.id, 'delete-highlight');
            break;
        }
        current = current.next;
    }

    if(!found) {
        showMessage(`Value ${value} not found`, 'error');
        return;
    }

    const result = list.deleteMiddle(value);
    if (result.success) {
        renderList();
        input.value = '';
        showMessage(`Deleted node with value ${value}`, 'delete');
    } else {
        showMessage(result.message, 'error');
    }
});

// Initial Render
renderList();
