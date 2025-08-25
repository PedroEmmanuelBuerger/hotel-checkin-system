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
  checkinsFiltrados: Checkin[] = []; // NOVA: Check-ins após aplicar filtros
  pessoas: Pessoa[] = [];
  mensagem: string = '';
  mensagemTipo: 'success' | 'error' | 'info' = 'info';
  mostrarPopupPessoa = false;
  mostrarPopupGerenciar = false;
  filtroAtivo: string = 'todos';
  paginaAtual = 1;
  itensPorPagina = 5; // Mudando para 5 itens por página
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

    // Corrigir timezone: converter para horário local
    const dataEntradaLocal = new Date(this.checkin.dataEntrada);
    const dataSaidaLocal = new Date(this.checkin.dataSaida);
    
    // CORREÇÃO: Ajustar para o timezone local (subtrair o offset)
    const offset = dataEntradaLocal.getTimezoneOffset() * 60000;
    const dataEntradaAjustada = new Date(dataEntradaLocal.getTime() - offset);
    const dataSaidaAjustada = new Date(dataSaidaLocal.getTime() - offset);

    const checkinParaCriar = {
      ...this.checkin,
      dataEntrada: dataEntradaAjustada.toISOString().slice(0, 19), // Remove .000Z
      dataSaida: dataSaidaAjustada.toISOString().slice(0, 19), // Remove .000Z
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
        this.checkinsFiltrados = [...this.checkins]; // Inicializa filtrados com todos
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
      this.resetarPaginacao(); // Reset paginação
      this.http.get<Checkin[]>(`/api/checkins/pessoa/documento/${this.filtroDocumento}`).subscribe({
        next: (response) => {
          this.checkinsFiltrados = response.map(checkin => ({
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
      this.resetarPaginacao(); // Reset paginação
      this.http.get<Checkin[]>(`/api/checkins/pessoa/nome/${this.filtroNome}`).subscribe({
        next: (response) => {
          this.checkinsFiltrados = response.map(checkin => ({
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
    this.resetarPaginacao(); // Reset paginação
    this.http.get<Checkin[]>('/api/checkins/presentes').subscribe({
      next: (response) => {
        this.checkinsFiltrados = response.map(checkin => ({
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
    this.resetarPaginacao(); // Reset paginação
    this.http.get<Checkin[]>('/api/checkins/saidos').subscribe({
      next: (response) => {
        this.checkinsFiltrados = response.map(checkin => ({
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

  buscarCheckinsReservaFutura() {
    this.resetarPaginacao(); // Reset paginação
    this.http.get<Checkin[]>('/api/checkins/reserva-futura').subscribe({
      next: (response) => {
        this.checkinsFiltrados = response.map(checkin => ({
          ...checkin,
          valorGasto: this.calcularValorGasto(checkin)
        }));
        this.filtroAtivo = 'reservaFutura';
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao buscar check-ins com reserva futura.', 'error');
        console.error('Erro ao buscar check-ins com reserva futura:', error);
      }
    });
  }

  // Métodos de paginação
  get checkinsDaPagina(): Checkin[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.checkinsFiltrados.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.checkinsFiltrados.length / this.itensPorPagina);
  }

  get temPaginaAnterior(): boolean {
    return this.paginaAtual > 1;
  }

  get temProximaPagina(): boolean {
    return this.paginaAtual < this.totalPaginas;
  }

  paginaAnterior(): void {
    if (this.temPaginaAnterior) {
      this.paginaAtual--;
    }
  }

  proximaPagina(): void {
    if (this.temProximaPagina) {
      this.paginaAtual++;
    }
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // CORREÇÃO: Resetar paginação ao aplicar filtros
  resetarPaginacao(): void {
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.filtroAtivo = 'todos';
    this.filtroDocumento = '';
    this.filtroNome = '';
    this.resetarPaginacao(); // Reset paginação
    this.checkinsFiltrados = [...this.checkins]; // Restaura todos os check-ins
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
    
    let valorTotal = 0;
    
    // CORREÇÃO: Inicializar com a data de entrada (inclusiva)
    let dataAtual = new Date(dataEntrada);
    // CORREÇÃO: Parar na data de saída (exclusiva)
    const dataSaidaDate = new Date(dataSaida);
    
    // CORREÇÃO: Loop apenas pelas noites (entrada inclusiva, saída exclusiva)
    let contadorNoites = 0;
    
    // CORREÇÃO: Comparar apenas as datas (sem hora) para contar noites
    const dataEntradaDate = new Date(dataEntrada.getFullYear(), dataEntrada.getMonth(), dataEntrada.getDate());
    const dataSaidaDateOnly = new Date(dataSaida.getFullYear(), dataSaida.getMonth(), dataSaida.getDate());
    
    // CORREÇÃO: Verificar se entrada e saída são no mesmo dia
    const mesmoDia = dataEntradaDate.getTime() === dataSaidaDateOnly.getTime();
    
    if (mesmoDia) {
      // Caso 1: Entrada e saída no mesmo dia
      const diaSemana = dataEntradaDate.getDay();
      const isFimDeSemana = diaSemana === 0 || diaSemana === 6; // 0 = domingo, 6 = sábado
      
      // Sempre cobra pelo menos 1 diária base
      const tarifaDiaria = isFimDeSemana ? 150 : 120;
      valorTotal += tarifaDiaria;
      
      let taxaGaragem = 0;
      if (checkin.adicionalVeiculo) {
        taxaGaragem = isFimDeSemana ? 20 : 15;
        valorTotal += taxaGaragem;
      }
      

      
      contadorNoites = 1; // Conta como 1 noite
    } else {
      // Caso 2: Entrada e saída em dias diferentes
      dataAtual = new Date(dataEntradaDate);
      
      while (dataAtual < dataSaidaDateOnly) {
        contadorNoites++;
        const diaSemana = dataAtual.getDay();
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6; // 0 = domingo, 6 = sábado
        
        const tarifaDiaria = isFimDeSemana ? 150 : 120;
        let taxaGaragem = 0;
        
        if (checkin.adicionalVeiculo) {
          taxaGaragem = isFimDeSemana ? 20 : 15;
        }
        
        const totalDia = tarifaDiaria + taxaGaragem;
        valorTotal += totalDia;
        

        
        // Avançar para o próximo dia
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }
    

    
    // Regra das 16:30 - só cobra se sair após 16:30
    const horaSaida = dataSaida.getHours();
    const minutoSaida = dataSaida.getMinutes();
    const horaSaidaMinutos = horaSaida * 60 + minutoSaida;
    const hora1630Minutos = 16 * 60 + 30; // 16:30 em minutos
    

    
    if (horaSaidaMinutos > hora1630Minutos) {
      const diaSemanaSaida = dataSaida.getDay();
      const isFimDeSemanaSaida = diaSemanaSaida === 0 || diaSemanaSaida === 6;
      
      const tarifaDiariaExtra = isFimDeSemanaSaida ? 150 : 120;
      let taxaGaragemExtra = 0;
      
      if (checkin.adicionalVeiculo) {
        taxaGaragemExtra = isFimDeSemanaSaida ? 20 : 15;
      }
      
      const totalExtra = tarifaDiariaExtra + taxaGaragemExtra;
      valorTotal += totalExtra;
      

    }
    

    return valorTotal;
  }

  mostrarMensagem(msg: string, tipo: 'success' | 'error' | 'info') {
    this.mensagem = msg;
    this.mensagemTipo = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
} 