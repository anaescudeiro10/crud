// scripts.js - Funções gerais para o sistema Farmácia Popular

// Função para mostrar/esconder senha
function togglePasswordVisibility(inputId, toggleButtonId) {
    const toggleButton = document.getElementById(toggleButtonId);
    const passwordInput = document.getElementById(inputId);

    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Alterar ícone
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
}

// Função para validar força da senha
function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return {
        score: strength,
        level: strength <= 1 ? 'fraca' : strength <= 3 ? 'média' : 'forte',
        color: strength <= 1 ? '#d32f2f' : strength <= 3 ? '#ff9800' : '#4CAF50'
    };
}

// Função para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para exibir mensagens
function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;

        // Definir cores baseadas no tipo
        const colors = {
            'success': '#4CAF50',
            'error': '#d32f2f',
            'info': '#2196F3',
            'warning': '#ff9800'
        };

        element.style.color = colors[type] || colors['info'];
        element.style.display = 'block';

        // Esconder mensagem após alguns segundos
        if (type !== 'error') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
}

// Função para validar formulário de cadastro
function validateCadastroForm() {
    const nome = document.getElementById('nome');
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmar_senha');
    let isValid = true;

    // Validar nome
    if (nome && nome.value.length < 3) {
        showMessage('nome-error', 'Nome deve ter pelo menos 3 caracteres', 'error');
        nome.style.borderColor = '#d32f2f';
        isValid = false;
    } else if (nome) {
        nome.style.borderColor = '#4CAF50';
    }

    // Validar senha
    if (senha && senha.value.length < 6) {
        showMessage('senha-error', 'Senha deve ter pelo menos 6 caracteres', 'error');
        senha.style.borderColor = '#d32f2f';
        isValid = false;
    } else if (senha) {
        senha.style.borderColor = '#4CAF50';
    }

    // Validar confirmação de senha
    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
        showMessage('confirmar-error', 'As senhas não coincidem', 'error');
        confirmarSenha.style.borderColor = '#d32f2f';
        isValid = false;
    } else if (confirmarSenha) {
        confirmarSenha.style.borderColor = '#4CAF50';
    }

    return isValid;
}

// Função para formatar CPF (se necessário)
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para fazer requisições AJAX
async function makeRequest(url, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { success: false, message: 'Erro de conexão' };
    }
}

// Função para inicializar todos os componentes
function initializeComponents() {
    console.log('Sistema Farmácia Popular inicializado');

    // Inicializar toggles de senha
    togglePasswordVisibility('senha', 'togglePassword');
    togglePasswordVisibility('confirmar_senha', 'toggleConfirmPassword');

    // Configurar validação em tempo real
    const senhaInput = document.getElementById('senha');
    if (senhaInput) {
        senhaInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text span');

            if (strengthBar && strengthText) {
                strengthBar.style.width = (strength.score * 20) + '%';
                strengthBar.style.backgroundColor = strength.color;
                strengthText.textContent = strength.level;
                strengthText.style.color = strength.color;
            }
        });
    }

    // Configurar validação de confirmação de senha
    const confirmarInput = document.getElementById('confirmar_senha');
    if (confirmarInput) {
        confirmarInput.addEventListener('input', function() {
            const senha = document.getElementById('senha');
            const matchElement = document.getElementById('passwordMatch');

            if (senha && matchElement) {
                if (senha.value === this.value && this.value !== '') {
                    matchElement.innerHTML = '<i class="fas fa-check-circle"></i> Senhas coincidem';
                    matchElement.style.color = '#4CAF50';
                    this.style.borderColor = '#4CAF50';
                } else if (this.value !== '') {
                    matchElement.innerHTML = '<i class="fas fa-times-circle"></i> As senhas não coincidem';
                    matchElement.style.color = '#d32f2f';
                    this.style.borderColor = '#d32f2f';
                }
            }
        });
    }

    // Prevenir envio de formulário inválido
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (this.id === 'cadastro-form' && !validateCadastroForm()) {
                e.preventDefault();
                showMessage('form-error', 'Por favor, corrija os erros antes de enviar', 'error');
            }
        });
    });
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeComponents);

// Exportar funções para uso global (se necessário)
if (typeof window !== 'undefined') {
    window.FarmaciaUtils = {
        togglePasswordVisibility,
        checkPasswordStrength,
        validateEmail,
        showMessage,
        validateCadastroForm,
        formatCPF,
        makeRequest
    };
}