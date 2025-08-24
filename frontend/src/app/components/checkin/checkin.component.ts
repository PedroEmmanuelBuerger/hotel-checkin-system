import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PessoaPopupComponent } from '../pessoa-popup/pessoa-popup.component';
import { GerenciarPessoasPopupComponent } from '../gerenciar-pessoas-popup/gerenciar-pessoas-popup.component';

interface Pessoa {
  nome: string;
  documento: string;
  telefone: string;
}

interface Checkin {
  pessoa: Pessoa;
  dataEntrada: string;
  dataSaida: string;
  adicionalVeiculo: boolean;
  valorGasto?: number;
}

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, PessoaPopupComponent, GerenciarPessoasPopupComponent],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss']
})
export class CheckinComponent implements OnInit {
  checkin: Checkin = {
    pessoa: { nome: '', documento: '', telefone: '' },
    dataEntrada: '',
    dataSaida: '',
    adicionalVeiculo: false
  };
  
  checkins: Checkin[] = [];
  pessoas: Pessoa[] = [];
  mensagem: string = '';
  mensagemTipo: 'success' | 'error' | 'info' = 'info';
  mostrarPopupPessoa = false;
  mostrarPopupGerenciar = false;
  filtroAtivo: string = 'todos';
  paginaAtual = 1;
  itensPorPagina = 10;
  totalCheckins = 0;
  statusBackend = 'Verificando...';
  
  filtroDocumento = '';
  filtroNome = '';
  
  // Propriedades para busca de pessoas
  buscaPessoa: string = '';
  sugestoesPessoas: Pessoa[] = [];
  mostrarSugestoes: boolean = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.listarPessoas();
    this.listarCheckins();
    this.verificarStatusBackend();
  }

  abrirPopupPessoa() {
    this.mostrarPopupPessoa = true;
  }

  fecharPopupPessoa() {
    this.mostrarPopupPessoa = false;
  }

  abrirPopupGerenciar() {
    this.mostrarPopupGerenciar = true;
  }

  fecharPopupGerenciar() {
    this.mostrarPopupGerenciar = false;
  }

  onPessoaCriada(pessoa: Pessoa) {
    this.listarPessoas();
    this.mostrarMensagem('Pessoa criada com sucesso! Agora você pode selecioná-la para o check-in.', 'success');
  }

  onPessoaAtualizada(pessoa: Pessoa) {
    this.listarPessoas();
    this.mostrarMensagem('Pessoa atualizada com sucesso!', 'success');
  }

  onPessoaExcluida(documento: string) {
    this.listarPessoas();
    this.mostrarMensagem('Pessoa excluída com sucesso!', 'success');
    
    // Se a pessoa excluída estava selecionada no checkin, limpar a seleção
    if (this.checkin.pessoa.documento === documento) {
      this.checkin.pessoa = { nome: '', documento: '', telefone: '' };
    }
  }

  buscarPessoas(event: any) {
    const termo = event.target.value.toLowerCase().trim();
    
    if (termo.length < 2) {
      this.sugestoesPessoas = [];
      this.mostrarSugestoes = false;
      return;
    }

    this.sugestoesPessoas = this.pessoas.filter(pessoa => 
      pessoa.nome.toLowerCase().includes(termo) || 
      pessoa.documento.toLowerCase().includes(termo)
    );
    
    this.mostrarSugestoes = this.sugestoesPessoas.length > 0;
  }

  selecionarPessoa(pessoa: Pessoa) {
    this.checkin.pessoa = pessoa;
    this.buscaPessoa = `${pessoa.nome} - ${pessoa.documento}`;
    this.mostrarSugestoes = false;
    this.sugestoesPessoas = [];
  }

  limparBuscaPessoa() {
    this.buscaPessoa = '';
    this.sugestoesPessoas = [];
    this.mostrarSugestoes = false;
  }

  onBlurBusca() {
    // Pequeno delay para permitir o clique nas sugestões
    setTimeout(() => {
      this.mostrarSugestoes = false;
    }, 200);
  }

  listarPessoas() {
    this.http.get<Pessoa[]>('/api/pessoas').subscribe({
      next: (response) => {
        this.pessoas = response;
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao carregar pessoas para o select.', 'error');
        console.error('Erro ao carregar pessoas:', error);
      }
    });
  }

  criarCheckin() {
    if (!this.validarFormulario()) {
      return;
    }

    const checkinParaCriar = {
      ...this.checkin,
      pessoa: {
        documento: this.checkin.pessoa.documento,
        nome: this.checkin.pessoa.nome,
        telefone: this.checkin.pessoa.telefone
      }
    };

    this.http.post<Checkin>('/api/checkins', checkinParaCriar).subscribe({
      next: (response) => {
        this.mostrarMensagem('Check-in criado com sucesso!', 'success');
        this.resetForm();
        this.listarCheckins();
      },
      error: (error) => {
        this.mostrarMensagem(error.error.erro || 'Erro ao criar check-in.', 'error');
        console.error('Erro ao criar check-in:', error);
      }
    });
  }

  listarCheckins() {
    this.http.get<Checkin[]>('/api/checkins').subscribe({
      next: (response) => {
        this.checkins = response.map(checkin => ({
          ...checkin,
          valorGasto: this.calcularValorGasto(checkin)
        }));
        this.contarCheckins();
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao listar check-ins.', 'error');
        console.error('Erro ao listar check-ins:', error);
      }
    });
  }

  buscarPorDocumento() {
    if (this.filtroDocumento.trim()) {
      this.http.get<Checkin[]>(`/api/checkins/pessoa/documento/${this.filtroDocumento}`).subscribe({
        next: (response) => {
          this.checkins = response.map(checkin => ({
            ...checkin,
            valorGasto: this.calcularValorGasto(checkin)
          }));
          this.filtroAtivo = 'documento';
        },
        error: (error) => {
          this.mostrarMensagem('Erro ao buscar por documento.', 'error');
          console.error('Erro ao buscar por documento:', error);
        }
      });
    }
  }

  buscarPorNome() {
    if (this.filtroNome.trim()) {
      this.http.get<Checkin[]>(`/api/checkins/pessoa/nome/${this.filtroNome}`).subscribe({
        next: (response) => {
          this.checkins = response.map(checkin => ({
            ...checkin,
            valorGasto: this.calcularValorGasto(checkin)
          }));
          this.filtroAtivo = 'nome';
        },
        error: (error) => {
          this.mostrarMensagem('Erro ao buscar por nome.', 'error');
          console.error('Erro ao buscar por nome:', error);
        }
      });
    }
  }

  buscarCheckinsPresentes() {
    this.http.get<Checkin[]>('/api/checkins/presentes').subscribe({
      next: (response) => {
        this.checkins = response.map(checkin => ({
          ...checkin,
          valorGasto: this.calcularValorGasto(checkin)
        }));
        this.filtroAtivo = 'presentes';
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao buscar check-ins presentes.', 'error');
        console.error('Erro ao buscar check-ins presentes:', error);
      }
    });
  }

  buscarCheckinsSaidos() {
    this.http.get<Checkin[]>('/api/checkins/saidos').subscribe({
      next: (response) => {
        this.checkins = response.map(checkin => ({
          ...checkin,
          valorGasto: this.calcularValorGasto(checkin)
        }));
        this.filtroAtivo = 'saidos';
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao buscar check-ins que saíram.', 'error');
        console.error('Erro ao buscar check-ins que saíram:', error);
      }
    });
  }

  limparFiltros() {
    this.filtroDocumento = '';
    this.filtroNome = '';
    this.filtroAtivo = 'todos';
    this.listarCheckins();
    this.mostrarMensagem('Filtros removidos. Mostrando todos os check-ins.', 'info');
  }

  contarCheckins() {
    this.http.get<any>('/api/checkins/count').subscribe({
      next: (response) => {
        this.totalCheckins = response.total;
      },
      error: (error) => {
        console.error('Erro ao contar check-ins:', error);
      }
    });
  }

  verificarStatusBackend() {
    this.http.get<any>('/api/checkins/health').subscribe({
      next: (response) => {
        this.statusBackend = 'Online';
      },
      error: (error) => {
        this.statusBackend = 'Offline';
        console.error('Erro ao conectar com backend:', error);
      }
    });
  }

  resetForm() {
    this.checkin = {
      pessoa: { nome: '', documento: '', telefone: '' },
      dataEntrada: '',
      dataSaida: '',
      adicionalVeiculo: false
    };
    this.limparBuscaPessoa();
  }

  validarFormulario(): boolean {
    if (!this.checkin.pessoa.nome || !this.checkin.pessoa.documento || !this.checkin.pessoa.telefone) {
      this.mostrarMensagem('Todos os campos da pessoa são obrigatórios.', 'error');
      return false;
    }

    if (!this.checkin.dataEntrada || !this.checkin.dataSaida) {
      this.mostrarMensagem('As datas de entrada e saída são obrigatórias.', 'error');
      return false;
    }

    const dataEntrada = new Date(this.checkin.dataEntrada);
    const dataSaida = new Date(this.checkin.dataSaida);

    if (dataSaida <= dataEntrada) {
      this.mostrarMensagem('A data de saída deve ser posterior à data de entrada.', 'error');
      return false;
    }

    const diffTime = Math.abs(dataSaida.getTime() - dataEntrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      this.mostrarMensagem('A estadia máxima é de 30 dias.', 'error');
      return false;
    }

    return true;
  }

  calcularValorGasto(checkin: Checkin): number {
    const dataEntrada = new Date(checkin.dataEntrada);
    const dataSaida = new Date(checkin.dataSaida);
    const diffTime = Math.abs(dataSaida.getTime() - dataEntrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diasEstadia = diffDays === 0 ? 1 : diffDays;
    
    const tarifaDiaria = 150.0;
    let valorBase = diasEstadia * tarifaDiaria;
    
    if (checkin.adicionalVeiculo) {
      valorBase += 50.0 * diasEstadia;
    }
    
    return valorBase;
  }

  mostrarMensagem(msg: string, tipo: 'success' | 'error' | 'info') {
    this.mensagem = msg;
    this.mensagemTipo = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
} 