import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Pessoa {
  nome: string;
  documento: string;
  telefone: string;
}

@Component({
  selector: 'app-gerenciar-pessoas-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="modal-backdrop" (click)="fechar()"></div>
    
    <!-- Modal -->
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Gerenciar Pessoas</h2>
          <button 
            type="button"
            (click)="fechar()"
            class="modal-close"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Formulário de Edição -->
          <div *ngIf="editando" class="edit-form">
            <h3 class="form-subtitle">Editar Pessoa</h3>
            <form (ngSubmit)="salvarEdicao()" #pessoaForm="ngForm">
              <div class="form-group">
                <label class="form-label">Nome *</label>
                <input 
                  type="text" 
                  [(ngModel)]="pessoaEditando.nome" 
                  name="nome" 
                  required
                  class="form-input"
                  placeholder="Digite o nome">
              </div>
              
              <div class="form-group">
                <label class="form-label">Documento *</label>
                <input 
                  type="text" 
                  [(ngModel)]="pessoaEditando.documento" 
                  name="documento" 
                  required
                  readonly
                  class="form-input form-input-readonly"
                  placeholder="Documento (não pode ser alterado)">
              </div>
              
              <div class="form-group">
                <label class="form-label">Telefone *</label>
                <input 
                  type="text" 
                  [(ngModel)]="pessoaEditando.telefone" 
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
                  Salvar Alterações
                </button>
                
                <button 
                  type="button" 
                  (click)="cancelarEdicao()"
                  class="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Lista de Pessoas -->
          <div *ngIf="!editando" class="pessoas-list">
            <div class="list-header">
              <h3 class="form-subtitle">Pessoas Cadastradas</h3>
              <span class="pessoas-count">{{ pessoas.length }} pessoa(s)</span>
            </div>
            
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="filtroBusca"
                placeholder="Buscar por nome ou documento..."
                class="form-input"
                (input)="filtrarPessoas()">
            </div>

            <div class="pessoas-table">
              <div *ngFor="let pessoa of pessoasFiltradas" class="pessoa-item">
                <div class="pessoa-info">
                  <div class="pessoa-nome">{{ pessoa.nome }}</div>
                  <div class="pessoa-documento">{{ pessoa.documento }}</div>
                  <div class="pessoa-telefone">{{ pessoa.telefone }}</div>
                </div>
                <div class="pessoa-actions">
                  <button 
                    type="button"
                    (click)="editarPessoa(pessoa)"
                    class="btn-action btn-edit"
                    title="Editar">
                    ✏️
                  </button>
                  <button 
                    type="button"
                    (click)="confirmarExclusao(pessoa)"
                    class="btn-action btn-delete"
                    title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>
              
              <div *ngIf="pessoasFiltradas.length === 0" class="no-pessoas">
                <p *ngIf="filtroBusca">Nenhuma pessoa encontrada com "{{ filtroBusca }}"</p>
                <p *ngIf="!filtroBusca">Nenhuma pessoa cadastrada</p>
              </div>
            </div>
          </div>

          <!-- Mensagens -->
          <div *ngIf="mensagem" 
               class="alert"
               [ngClass]="{
                 'alert-success': mensagemTipo === 'success',
                 'alert-error': mensagemTipo === 'error',
                 'alert-info': mensagemTipo === 'info'
               }">
            {{ mensagem }}
          </div>
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
      max-width: 700px;
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

    /* Form Subtitle */
    .form-subtitle {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem 0;
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

    .form-input-readonly {
      background-color: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }

    /* Lista de Pessoas */
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .pessoas-count {
      font-size: 0.875rem;
      color: #6b7280;
      background-color: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
    }

    .search-box {
      margin-bottom: 1rem;
    }

    .pessoas-table {
      max-height: 400px;
      overflow-y: auto;
    }

    .pessoa-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
    }

    .pessoa-item:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    .pessoa-info {
      flex: 1;
    }

    .pessoa-nome {
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .pessoa-documento {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.125rem;
    }

    .pessoa-telefone {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .pessoa-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .btn-edit:hover {
      background-color: #dbeafe;
    }

    .btn-delete:hover {
      background-color: #fee2e2;
    }

    .no-pessoas {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
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

    .alert-info {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
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
      
      .pessoa-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .pessoa-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class GerenciarPessoasPopupComponent implements OnInit {
  @Output() pessoaAtualizada = new EventEmitter<Pessoa>();
  @Output() pessoaExcluida = new EventEmitter<string>();
  @Output() fechado = new EventEmitter<void>();

  pessoas: Pessoa[] = [];
  pessoasFiltradas: Pessoa[] = [];
  pessoaEditando: Pessoa = { nome: '', documento: '', telefone: '' };
  editando = false;
  filtroBusca = '';
  mensagem = '';
  mensagemTipo: 'success' | 'error' | 'info' = 'info';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.http.get<Pessoa[]>('/api/pessoas').subscribe({
      next: (response) => {
        this.pessoas = response;
        this.pessoasFiltradas = [...this.pessoas];
        this.mostrarMensagem(`Carregadas ${response.length} pessoas`, 'info');
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
        this.mostrarMensagem('Erro ao carregar pessoas', 'error');
      }
    });
  }

  filtrarPessoas() {
    if (!this.filtroBusca.trim()) {
      this.pessoasFiltradas = [...this.pessoas];
    } else {
      const busca = this.filtroBusca.toLowerCase();
      this.pessoasFiltradas = this.pessoas.filter(pessoa => 
        pessoa.nome.toLowerCase().includes(busca) ||
        pessoa.documento.toLowerCase().includes(busca)
      );
    }
  }

  editarPessoa(pessoa: Pessoa) {
    this.pessoaEditando = { ...pessoa };
    this.editando = true;
    this.mensagem = '';
  }

  cancelarEdicao() {
    this.editando = false;
    this.pessoaEditando = { nome: '', documento: '', telefone: '' };
    this.mensagem = '';
  }

  salvarEdicao() {
    this.http.put<Pessoa>(`/api/pessoas/documento/${this.pessoaEditando.documento}`, this.pessoaEditando).subscribe({
      next: (response) => {
        this.mostrarMensagem('Pessoa atualizada com sucesso!', 'success');
        this.pessoaAtualizada.emit(response);
        this.cancelarEdicao();
        this.carregarPessoas();
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.mostrarMensagem('Erro ao atualizar pessoa', 'error');
      }
    });
  }

  confirmarExclusao(pessoa: Pessoa) {
    if (confirm(`Tem certeza que deseja excluir "${pessoa.nome}"?`)) {
      this.excluirPessoa(pessoa.documento);
    }
  }

  excluirPessoa(documento: string) {
    this.http.delete(`/api/pessoas/documento/${documento}`).subscribe({
      next: (response) => {
        this.mostrarMensagem('Pessoa excluída com sucesso!', 'success');
        this.pessoaExcluida.emit(documento);
        this.carregarPessoas();
      },
      error: (error) => {
        console.error('Erro ao excluir pessoa:', error);
        this.mostrarMensagem('Erro ao excluir pessoa', 'error');
      }
    });
  }

  fechar() {
    this.fechado.emit();
  }

  mostrarMensagem(texto: string, tipo: 'success' | 'error' | 'info') {
    this.mensagem = texto;
    this.mensagemTipo = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
} 