import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Pessoa {
  id?: string;
  nome: string;
  documento: string;
  telefone: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

@Component({
  selector: 'app-pessoa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
         Sistema de Hotel - CRUD de Pessoas
      </h1>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ editando ? ' Editar Pessoa' : ' Nova Pessoa' }}
        </h2>
        
        <form (ngSubmit)="salvarPessoa()" #pessoaForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input 
                type="text" 
                [(ngModel)]="pessoa.nome" 
                name="nome" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
              <input 
                type="text" 
                [(ngModel)]="pessoa.documento" 
                name="documento" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o documento">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input 
                type="text" 
                [(ngModel)]="pessoa.telefone" 
                name="telefone" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o telefone">
            </div>
          </div>
          
          <div class="flex gap-2">
            <button 
              type="submit" 
              [disabled]="!pessoaForm.valid"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {{ editando ? 'Atualizar' : 'Salvar' }}
            </button>
            
            <button 
              type="button" 
              (click)="cancelarEdicao()"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalPessoas }}</div>
          <div class="text-sm text-gray-600">Total de Pessoas</div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ pessoas.length }}</div>
          <div class="text-sm text-gray-600">Pessoas Cadastradas</div>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ statusBackend }}</div>
          <div class="text-sm text-gray-600">Status Backend</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold">👥 Lista de Pessoas</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let p of pessoas" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ p.nome }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.documento }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.telefone }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ p.dataCriacao | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    (click)="editarPessoa(p)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3">
                     Editar
                  </button>
                  <button 
                    (click)="deletarPessoa(p.id!)"
                    class="text-red-600 hover:text-red-900">
                     Deletar
                  </button>
                </td>
              </tr>
              
              <tr *ngIf="pessoas.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  Nenhuma pessoa cadastrada
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="mensagem" 
           class="fixed top-4 right-4 p-4 rounded-md shadow-lg"
           [ngClass]="{
             'bg-green-500 text-white': mensagemTipo === 'success',
             'bg-red-500 text-white': mensagemTipo === 'error',
             'bg-blue-500 text-white': mensagemTipo === 'info'
           }">
        {{ mensagem }}
        <button (click)="mensagem = ''" class="ml-2 text-white hover:text-gray-200">×</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
  `]
})
export class PessoaComponent implements OnInit {
  pessoas: Pessoa[] = [];
  pessoa: Pessoa = { nome: '', documento: '', telefone: '' };
  editando = false;
  pessoaEditandoId: string = '';
  totalPessoas = 0;
  statusBackend = ' Verificando...';
  mensagem = '';
  mensagemTipo: 'success' | 'error' | 'info' = 'info';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.verificarBackend();
    this.carregarPessoas();
    this.atualizarContador();
  }

  verificarBackend() {
    this.http.get<any>('/api/pessoas/health').subscribe({
      next: (response) => {
        this.statusBackend = ' Online';
      },
      error: (error) => {
        this.statusBackend = ' Offline';
        console.error('Erro ao conectar com backend:', error);
      }
    });
  }

  carregarPessoas() {
    this.http.get<Pessoa[]>('/api/pessoas').subscribe({
      next: (response) => {
        this.pessoas = response;
        this.mostrarMensagem(`Carregadas ${response.length} pessoas`, 'info');
      },
      error: (error) => {
        console.error('Erro ao carregar pessoas:', error);
        this.mostrarMensagem('Erro ao carregar pessoas', 'error');
      }
    });
  }

  atualizarContador() {
    this.http.get<any>('/api/pessoas/count').subscribe({
      next: (response) => {
        this.totalPessoas = response.total;
      },
      error: (error) => {
        console.error('Erro ao contar pessoas:', error);
      }
    });
  }

  salvarPessoa() {
    if (this.editando) {
      this.atualizarPessoa();
    } else {
      this.criarPessoa();
    }
  }

  criarPessoa() {
    this.http.post<Pessoa>('/api/pessoas', this.pessoa).subscribe({
      next: (response) => {
        this.mostrarMensagem('Pessoa criada com sucesso!', 'success');
        this.limparFormulario();
        this.carregarPessoas();
        this.atualizarContador();
      },
      error: (error) => {
        console.error('Erro ao criar pessoa:', error);
        this.mostrarMensagem('Erro ao criar pessoa', 'error');
      }
    });
  }

  atualizarPessoa() {
    this.http.put<Pessoa>(`/api/pessoas/${this.pessoaEditandoId}`, this.pessoa).subscribe({
      next: (response) => {
        this.mostrarMensagem('Pessoa atualizada com sucesso!', 'success');
        this.limparFormulario();
        this.carregarPessoas();
      },
      error: (error) => {
        console.error('Erro ao atualizar pessoa:', error);
        this.mostrarMensagem('Erro ao atualizar pessoa', 'error');
      }
    });
  }

  editarPessoa(pessoa: Pessoa) {
    this.pessoa = { ...pessoa };
    this.editando = true;
    this.pessoaEditandoId = pessoa.id!;
  }

  cancelarEdicao() {
    this.limparFormulario();
  }

  deletarPessoa(id: string) {
    if (confirm('Tem certeza que deseja deletar esta pessoa?')) {
      this.http.delete(`/api/pessoas/${id}`).subscribe({
        next: (response) => {
          this.mostrarMensagem('Pessoa deletada com sucesso!', 'success');
          this.carregarPessoas();
          this.atualizarContador();
        },
        error: (error) => {
          console.error('Erro ao deletar pessoa:', error);
          this.mostrarMensagem('Erro ao deletar pessoa', 'error');
        }
      });
    }
  }

  limparFormulario() {
    this.pessoa = { nome: '', documento: '', telefone: '' };
    this.editando = false;
    this.pessoaEditandoId = '';
  }

  mostrarMensagem(texto: string, tipo: 'success' | 'error' | 'info') {
    this.mensagem = texto;
    this.mensagemTipo = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 5000);
  }
} 