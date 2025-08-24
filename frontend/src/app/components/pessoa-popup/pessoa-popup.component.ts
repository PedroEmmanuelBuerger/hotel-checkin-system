import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Pessoa {
  nome: string;
  documento: string;
  telefone: string;
}

@Component({
  selector: 'app-pessoa-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="modal-backdrop" (click)="fechar()"></div>
    
    <!-- Modal -->
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Incluir Nova Pessoa</h2>
          <button 
            type="button"
            (click)="fechar()"
            class="modal-close"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form (ngSubmit)="salvarPessoa()" #pessoaForm="ngForm" class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input 
              type="text" 
              [(ngModel)]="pessoa.nome" 
              name="nome" 
              required
              class="form-input"
              placeholder="Digite o nome">
          </div>
          
          <div class="form-group">
            <label class="form-label">Documento *</label>
            <input 
              type="text" 
              [(ngModel)]="pessoa.documento" 
              name="documento" 
              required
              class="form-input"
              placeholder="Digite o documento">
          </div>
          
          <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input 
              type="text" 
              [(ngModel)]="pessoa.telefone" 
              name="telefone" 
              required
              class="form-input"
              placeholder="Digite o telefone">
          </div>
          
          <div class="modal-actions">
            <button 
              type="submit" 
              [disabled]="!pessoaForm.valid"
              class="btn btn-primary">
              Salvar
            </button>
            
            <button 
              type="button" 
              (click)="fechar()"
              class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>

        <div *ngIf="mensagem" 
             class="alert"
             [ngClass]="{
               'alert-success': mensagemTipo === 'success',
               'alert-error': mensagemTipo === 'error'
             }">
          {{ mensagem }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    /* Modal Container */
    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      padding: 1rem;
    }

    /* Modal Content */
    .modal-content {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease-out;
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      font-weight: bold;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    /* Modal Body */
    .modal-body {
      padding: 1.5rem;
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Modal Actions */
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #4b5563;
    }

    /* Alert Messages */
    .alert {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .alert-success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .alert-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    /* Animations */
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-container {
        padding: 0.5rem;
      }
      
      .modal-content {
        max-width: 100%;
        margin: 0;
      }
      
      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PessoaPopupComponent {
  @Output() pessoaCriada = new EventEmitter<Pessoa>();
  @Output() fechado = new EventEmitter<void>();

  pessoa: Pessoa = { nome: '', documento: '', telefone: '' };
  mensagem = '';
  mensagemTipo: 'success' | 'error' = 'success';

  constructor(private http: HttpClient) {}

  salvarPessoa() {
    this.http.post<Pessoa>('/api/pessoas', this.pessoa).subscribe({
      next: (response) => {
        this.mostrarMensagem('Pessoa criada com sucesso!', 'success');
        setTimeout(() => {
          this.pessoaCriada.emit(response);
          this.fechar();
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao criar pessoa:', error);
        this.mostrarMensagem('Erro ao criar pessoa', 'error');
      }
    });
  }

  fechar() {
    this.fechado.emit();
  }

  mostrarMensagem(texto: string, tipo: 'success' | 'error') {
    this.mensagem = texto;
    this.mensagemTipo = tipo;
  }
} 