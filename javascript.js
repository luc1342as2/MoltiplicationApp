/* Calculator logic — full functions, keyboard support */

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let expression = '';
let currentValue = '0';
let memory = 0;
let lastOp = null;
let lastAction = null;

function updateDisplay() {
    expressionEl.textContent = expression || '';
    resultEl.textContent = formatDisplay(currentValue);
}

function formatDisplay(str) {
    if (str === '' || str === '-') return str;
    const num = parseFloat(str);
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Error';
    const s = String(num);
    if (s.length > 14) return Number(num).toExponential(6);
    return s;
}

function inputDigit(d) {
    if (lastAction === '=') {
        expression = '';
        currentValue = '';
    }
    if (currentValue === '0' && d !== '.') currentValue = '';
    if (currentValue === '-0' && d !== '.') currentValue = '-';
    if (d === '0' && currentValue === '') return;
    currentValue += d;
    lastAction = 'digit';
    updateDisplay();
}

function inputDecimal() {
    if (lastAction === '=') {
        expression = '';
        currentValue = '0';
    }
    if (currentValue === '') currentValue = '0';
    if (currentValue.includes('.')) return;
    currentValue += '.';
    lastAction = 'decimal';
    updateDisplay();
}

function clearEntry() {
    currentValue = '0';
    lastAction = 'ce';
    updateDisplay();
}

function clearAll() {
    expression = '';
    currentValue = '0';
    lastOp = null;
    lastAction = 'c';
    updateDisplay();
}

function backspace() {
    if (lastAction === '=') return clearAll();
    if (currentValue.length <= 1 || (currentValue.length === 2 && currentValue.startsWith('-'))) {
        currentValue = '0';
    } else {
        currentValue = currentValue.slice(0, -1);
    }
    lastAction = 'backspace';
    updateDisplay();
}

function toggleSign() {
    if (lastAction === '=') expression = '';
    const num = parseFloat(currentValue);
    if (isNaN(num)) return;
    currentValue = num === 0 ? '0' : String(-num);
    lastAction = '±';
    updateDisplay();
}

function applyUnary(fn) {
    const num = parseFloat(currentValue);
    if (isNaN(num)) return;
    let result;
    switch (fn) {
        case 'sqrt':
            if (num < 0) { resultEl.textContent = 'Error'; return; }
            result = Math.sqrt(num);
            break;
        case 'sq':
            result = num * num;
            break;
        case 'recip':
            if (num === 0) { resultEl.textContent = 'Error'; return; }
            result = 1 / num;
            break;
        default:
            return;
    }
    if (!isFinite(result)) { resultEl.textContent = 'Error'; return; }
    currentValue = String(result);
    expression = expression ? `${expression} → ${formatDisplay(currentValue)}` : `${fn}(${num})`;
    lastAction = 'unary';
    updateDisplay();
}

function percent() {
    const num = parseFloat(currentValue);
    if (isNaN(num)) return;
    currentValue = String(num / 100);
    lastAction = '%';
    updateDisplay();
}

function setOperator(op) {
    const sym = { '+': '+', '-': '−', '×': '×', '÷': '÷' }[op] || op;
    if (lastAction === '=') {
        expression = formatDisplay(currentValue) + ' ' + sym;
        lastOp = op;
        currentValue = '0';
    } else if (lastAction === 'digit' || lastAction === 'decimal' || lastAction === '±' || lastAction === '%' || lastAction === 'unary') {
        expression = (expression ? expression + ' ' : '') + formatDisplay(currentValue) + ' ' + sym;
        lastOp = op;
        currentValue = '0';
    } else if (lastAction === 'op') {
        expression = expression.trim().replace(/\s[+\-×÷]\s*$/, ' ' + sym);
        lastOp = op;
    }
    lastAction = 'op';
    updateDisplay();
}

function evaluate() {
    if (lastOp == null) return;
    const a = parseFloat(expression.split(/\s+/)[0]);
    const b = parseFloat(currentValue);
    if (isNaN(a) || isNaN(b)) return;
    let result;
    switch (lastOp) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '×': result = a * b; break;
        case '÷': result = b === 0 ? NaN : a / b; break;
        default: return;
    }
    if (!isFinite(result)) {
        resultEl.textContent = 'Error';
        return;
    }
    expression = expression + ' ' + formatDisplay(currentValue) + ' =';
    currentValue = String(result);
    lastOp = null;
    lastAction = '=';
    updateDisplay();
}

// Memory
function memoryClear() { memory = 0; lastAction = 'mc'; updateDisplay(); }
function memoryRecall() {
    currentValue = String(memory);
    if (lastAction === '=') expression = '';
    lastAction = 'mr';
    updateDisplay();
}
function memoryAdd() {
    const num = parseFloat(currentValue);
    if (!isNaN(num)) memory += num;
    lastAction = 'm+';
    updateDisplay();
}
function memorySubtract() {
    const num = parseFloat(currentValue);
    if (!isNaN(num)) memory -= num;
    lastAction = 'm-';
    updateDisplay();
}

function handleButton(btn) {
    if (btn.dataset.value != null) {
        inputDigit(btn.dataset.value);
        return;
    }
    const action = btn.dataset.action;
    if (!action) return;
    switch (action) {
        case 'decimal': inputDecimal(); break;
        case 'clear': clearAll(); break;
        case 'ce': clearEntry(); break;
        case 'backspace': backspace(); break;
        case '±': toggleSign(); break;
        case '%': percent(); break;
        case 'sqrt': case 'sq': case 'recip': applyUnary(action); break;
        case '+': case '-': case '×': case '÷': setOperator(action); break;
        case '=': evaluate(); break;
        case 'mc': memoryClear(); break;
        case 'mr': memoryRecall(); break;
        case 'm+': memoryAdd(); break;
        case 'm-': memorySubtract(); break;
    }
}

document.querySelectorAll('.keypad .btn').forEach(btn => {
    btn.addEventListener('click', () => handleButton(btn));
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        inputDigit(e.key);
        return;
    }
    switch (e.key) {
        case '.':
        case ',':
            e.preventDefault();
            inputDecimal();
            break;
        case 'Backspace':
            e.preventDefault();
            backspace();
            break;
        case 'Escape':
        case 'c':
        case 'C':
            e.preventDefault();
            clearAll();
            break;
        case '+':
            e.preventDefault();
            setOperator('+');
            break;
        case '-':
            e.preventDefault();
            setOperator('-');
            break;
        case '*':
            e.preventDefault();
            setOperator('×');
            break;
        case '/':
            e.preventDefault();
            setOperator('÷');
            break;
        case 'Enter':
        case '=':
            e.preventDefault();
            evaluate();
            break;
        default:
            break;
    }
});

updateDisplay();
