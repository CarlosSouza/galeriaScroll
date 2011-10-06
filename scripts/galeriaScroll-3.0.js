/*
  ----
    galeriaScroll v3.0
  ----
  
  
  AUTOR:
  
    Carlos Eduardo de Souza - http://www.webstandards.blog.br
  
  INSTRUCOES:
  
    Criar uma nova instancia chamando o plugin no elemento desejado.
    Caso queira mudar alguma das opcoes, declare o novo valor dentro da instancia, por exemplo:
    
    var galeria = new $.galeriaScroll($('#elemento'), {
      paginacao: true
    });
    
    Se nenhuma opcao for definida, a galeria contruida usa os valores padroes:
    
    var defaults = {
      'galeriaAnterior'  : 'anterior',        // classe para o link anterior
      'galeriaProximo'   : 'proximo',         // classe para o link proximo
      'itemGaleria'      : 'figure',          // elemento que contem cada item da galeria
      'estruturaGaleria' : '.mascara > div',  // elemento que sera animado (com margin)
      'velocidade'       : 250,               // velocidade da animacao em ms
      'paginacao'        : false,             // true ou false para exibir ou esconder a paginacao
      'ampliacao'        : false              // true ou false para exibir ou esconder a popup da imagem ampliada
    };
    
    Para executar o scroll da galeria por um link externo, basta executar o metodo no clique do mesmo.
    O link DEVE ter a mesma classe usada na navegacao da galeria (por padrao usa-se 'anterior' e 'proximo'):
    
    $('a').click(function(){
      galeria.scrollImagens($(this).attr('class')); // o nome 'galeria' esta relacionado a instancia criada acima
      
      return false;
    });
    
    No caso da paginacao, define-se para qual pagina o link apontara:
    
    $('a').click(function(){
      galeria.scrollPaginacao('2');
      
      return false;
    });
  
  OBSERVACOES:
    
    Elemento com a classe "mascara" envolvendo os itens da lista, logo abaixo da galeria. Ex: div.galeria > div.mascara ...
    Classe "inativo" para os elementos nao-clicaveis
    Classe "ativo" para o item da paginacao atual
    Classe "paginacao" para a paginacao, caso exista
    
    
*/

;(function($) {

  $.galeriaScroll = function(el, options) {
  
    var defaults = {
      'galeriaAnterior'  : 'anterior',        // classe para o link anterior
      'galeriaProximo'   : 'proximo',         // classe para o link proximo
      'itemGaleria'      : 'figure',          // elemento que contem cada item da galeria
      'estruturaGaleria' : '.mascara > div',  // elemento que sera animado (com margin)
      'velocidade'       : 250,               // velocidade da animacao em ms
      'paginacao'        : false,             // true / false para exibir ou esconder a paginacao
      'ampliacao'        : false              // true / false para exibir ou esconder a popup da imagem ampliada
    };
    
    var plugin = this;
    plugin.settings = {};
    
    var init = function() {
      plugin.settings = $.extend({}, defaults, options);
      plugin.el = el;
      
      // largura 9999em para nao quebrar a galeria em linhas
      $(plugin.settings.estruturaGaleria, el).css('width', '9999em');
      
      // inserindo os links de navegacao em cada galeria
      el.prepend('<a class="'+ plugin.settings.galeriaAnterior +'" href="#" title="Navegar para a direita">Anterior</a> <a class="'+ plugin.settings.galeriaProximo +'" href="#" title="Navegar para a esquerda">Pr&oacute;ximo</a>');
      
      // variavel com o valor do ID da galeria
      var gAtual = el.attr('id');

      // criando variavel dinamica
      window["n_" + gAtual] = 0;
      
      // largura do elemento que envolve a galeria
      window["largura_" + gAtual] = $('.mascara', el).width();
      
      // limite de elementos a aparecer na tela, de acordo com a largura total / largura de cada item
      window["limite_" + gAtual] = Math.ceil(window["largura_" + gAtual] / $(plugin.settings.itemGaleria, el).outerWidth(true));
      
      // elemento da galeria, dentro da galeria especifica
      window["galeria_" + gAtual] = $(plugin.settings.estruturaGaleria, el);
      
      // adicionando class "inativo" para o link anterior, alem de esconder o "proximo" se os itens forem <= que o limite
      $('a.'+ plugin.settings.galeriaAnterior, el).addClass('inativo');
      window["total_" + gAtual] = $(plugin.settings.itemGaleria, el).length;
      if (window["total_" + gAtual] <= window["limite_" + gAtual]) $('a.'+ plugin.settings.galeriaProximo, el).addClass('inativo');
      
      // numero de scrolls possiveis
      window["scrolls_" + gAtual] = Math.ceil(window["total_" + gAtual] / window["limite_" + gAtual]) - 1;
      
      // numero de scrolls possiveis
      limiteScrolls = Math.ceil(window["total_" + gAtual] / window["limite_" + gAtual]) - 1;
      
      // criacao da paginacao
      if(plugin.settings.paginacao){
        
        // insere o elemento <ol> para a paginacao
        el.append('<ol class="paginacao"></ol>');
        
        // cria os elementos da paginacao de acordo com os scrolls
        var i = 0;
        for (i = 0; i <= limiteScrolls ; i++) {
          var texto = parseInt(i) + 1;
          $('ol.paginacao', el).append('<li><a href="#" title="Navegar na galeria">'+ texto +'</a></li>') 
        }
        
        // classe 'ativo' para o primeiro item da lista
        $('ol.paginacao li:first', el).addClass('ativo');
        
      }
      
      // Clique nos links de navegacao
      $('#'+ gAtual +' a.'+ plugin.settings.galeriaAnterior +', '+'#'+ gAtual +' a.'+ plugin.settings.galeriaProximo).click(function(){

        plugin.scrollGaleria($(this).attr('class').split(' ')[0]);
        
        return false;
        
      });
      
      // Clique nos links da paginacao
      if(plugin.settings.paginacao){
      
        $('ol.paginacao'+' li a', el).click(function(){
          
          plugin.scrollPaginacao($(this).parent().index());
          
          return false;
          
        });
      
      }
      
      // Clique para ampliar a imagem
      if(plugin.settings.ampliacao){
        $(''+ plugin.settings.itemGaleria, el).click(function(){
        
          $(''+ plugin.settings.itemGaleria, el).removeClass('ativo');
          $(this).addClass('ativo');
          
          plugin.ampliaImagem($(this).index());
          
          return false;
          
        });
        
        $('#imagem_ampliada a').live('click', function(){
          plugin.scrollImagens($(this).attr('class'));
          
          return false;
        });
        
      }
      
    };
    
    plugin.scrollGaleria = function(direcao) {
      
      var g = el.attr('id');
      
      if(!$('a.'+ direcao, el).hasClass('inativo')){
        
        // ao clicar na navegacao, retira a classe 'ativo' de todos os itens da paginacao
        if(plugin.settings.paginacao){
          $('ol.paginacao li', el).removeClass('ativo');
        }
      
        switch (direcao){
        
          /* 
            Caso a direcao seja 'anterior' tira 1 da variavel a cada clique,
            retira a classe 'inativo' do link 'proximo',
            se a variavel dinamica for = 0 adiciona a class 'inativo',
            faz o efeito de scroll
          */
          
          case plugin.settings.galeriaAnterior : 
          
            window["n_" + g] -= 1;
            $('a.'+ plugin.settings.galeriaProximo, el).removeClass('inativo'); 
            if (window["n_" + g] == 0) { $('a.'+ direcao, el).addClass('inativo'); }
            
            window["galeria_" + g].animate({
              'margin-left' : '+='+ window["largura_" + g] +'px',
              'margin-right' : '+='+ window["largura_" + g] +'px'
            }, plugin.settings.velocidade);
            
            if(plugin.settings.paginacao){
              // insere a classe 'ativo' no item da paginacao correspondente ao clique
              $('ol.paginacao li:eq('+ window["n_" + g] +')', el).addClass('ativo');
            }
            
          break;
          
          /* 
            Caso a direcao seja 'proximo' soma 1 da variavel a cada clique,
            mostra o link 'anterior',
            se os cliques atingirem o limite adiciona a class 'inativo',
            faz o efeito de scroll
          */
          
          case plugin.settings.galeriaProximo : 
          
            // ao clicar na navegacao, retira a classe 'ativo' de todos os itens da paginacao
            if(plugin.settings.paginacao){
              $('ol.paginacao li', el).removeClass('ativo');
            }
            window["n_" + g] += 1;
            $('a.'+ plugin.settings.galeriaAnterior, el).removeClass('inativo');
            if (window["n_" + g] == window["scrolls_" + g]) { $('#'+ g +' a.'+ direcao).addClass('inativo'); }
            
            window["galeria_" + g].animate({
              'margin-left' : '-='+ window["largura_" + g] +'px',
              'margin-right' : '-='+ window["largura_" + g] +'px'
            }, plugin.settings.velocidade);
            
            if(plugin.settings.paginacao){
              // insere a classe 'ativo' no item da paginacao correspondente ao clique
              $('ol.paginacao li:eq('+ window["n_" + g] +')', el).addClass('ativo');
            }
            
          break;
          
        }
        
      }

    };
    
    plugin.scrollPaginacao = function(i){
      
      var g = el.attr('id');
      
      // atualizando a variavel dos cliques
      window["n_" + g] = parseInt(i);
      
      // remove a classe ativo e insere no item especifico
      $('ol.paginacao'+' li', el).removeClass('ativo');
      $('ol.paginacao li:eq('+ window["n_" + g] +')', el).addClass('ativo');
      
      if (window["n_" + g] == 0) { 
        $('a.'+ plugin.settings.galeriaAnterior, el).addClass('inativo'); 
        $('a.'+ plugin.settings.galeriaProximo, el).removeClass('inativo');
      } else if (window["n_" + g] > 0 || window["n_" + g] <= window["scrolls_" + g]) { 
        $('a.'+ plugin.settings.galeriaAnterior, el).removeClass('inativo');
        $('a.'+ plugin.settings.galeriaProximo, el).removeClass('inativo');
      }
      
      if (window["n_" + g] == window["scrolls_" + g]) { 
        $('a.'+ plugin.settings.galeriaProximo, el).addClass('inativo');
      }
      
      window["galeria_" + g].animate({
        'margin-left' : '-'+ window["largura_" + g] * i +'px',
        'margin-right' : '-'+ window["largura_" + g] * i +'px'
      }, plugin.settings.velocidade); 
    
    };
    
    plugin.ampliaImagem = function(i){
      
      var source = $(''+ plugin.settings.itemGaleria +':eq('+ i +') a', el).attr('href');
      $('body').prepend('<div id="imagem_ampliada"><a class="fechar" href="#" title="Fechar janela">Fechar</a> <div class="nav"><a class="'+ plugin.settings.galeriaAnterior +'" href="#" title="Navegar para esquerda">Anterior</a> <a class="'+ plugin.settings.galeriaProximo +'" href="#" title="Navegar para a direita">Pr&oacute;ximo</a></div> <img src="'+ source +'" alt="Imagem ampliada" /></div>');
      
      var popup = $('#imagem_ampliada');
      popup.css({ position : 'absolute', textAlign : 'center', zIndex : '10' });
      $('img', popup).css({ display : 'block' });
      
      // definindo as medidas
      var alturaJanela = $(window).height();
      var alturaBody = $('body').outerHeight();
      var alturaPopup = popup.outerHeight();
      var larguraPopup = popup.outerWidth();
      
      // exibindo a popup e centralizando na tela
      popup
      .css('top', (alturaJanela - alturaPopup) / 2 + $(window).scrollTop() + "px")
      .css('left', '50%')
      .css('margin-left', '-' + larguraPopup/2 + 'px');
      
      // criando a pelicula
      if (alturaBody > alturaJanela){
        alturaPelicula = alturaBody; 
      } else {
        alturaPelicula = alturaJanela;
      }
      $('body').prepend('<div class="pelicula"></div>');
      
      pelicula = $('.pelicula');
      
      pelicula.css({ position : 'absolute', top : '0', left : '0', width : '100%', height : alturaPelicula, background: '#000', opacity : '.5', zIndex : '9' });
      if(alturaJanela < alturaPopup){
        diferenca = alturaPopup - alturaJanela;
        popup.css('margin-top', diferenca / 2);
        pelicula.css('padding-top', diferenca);
      }
      
      function fechaPopup() {
        $('#imagem_ampliada, .pelicula').remove();
        $(''+ plugin.settings.itemGaleria +'', el).removeClass('ativo');
      }
      
      // definindo as medidas da janela
      $(window).resize(function() {
        
        // se a pelicula existir, a janela redimensionada modifica suas medidas
        if($('.pelicula').get(0)){
          alturaJanela = $(window).height();
          
          // verifica se a altura do body for maior que o tamanho da popup + seu posicionamento na tela
          if(alturaBody > (popup.outerHeight() + parseInt(popup.css('top')))){
            alturaConteudo = alturaBody;
          } else {
            alturaConteudo = popup.outerHeight() + parseInt(popup.css('top'));
          }
          
          // verifica se a altura da janela for maior que a variavel definida na condicao acima, redimensionando a pelicula
          if(alturaJanela > alturaConteudo){
            $('.pelicula').css({ height : alturaJanela + 'px' });
          } else {
            $('.pelicula').css({ height : alturaConteudo + 'px' });
          }
        }
      
      });
      
      // clicando no link 'fechar' ou na pelicula
      $('#imagem_ampliada a.fechar, .pelicula').live('click', function(){
        fechaPopup();
        return false;
      });
      
      // apertando ESC
      $(document).keyup(function(e) {
        if (e.keyCode == 27) { fechaPopup(); }
      });
    
    };
    
    plugin.scrollImagens = function(direcao){
      
      var g = el.attr('id');
      var n = window["n_" + g] + 1;
      var atual = $(''+ plugin.settings.itemGaleria +'.ativo', el);
      
      if (direcao == plugin.settings.galeriaAnterior){
        var item = atual.prev();
      } else {
        var item = atual.next();
      }
      
      var indiceAtual = atual.index();
      var indice = item.index();
      var limite = indice / n;
      
      if(indice >= 0 && indice <= (window["total_" + g] - 1)){
      
        $(''+ plugin.settings.itemGaleria +'', el).removeClass('ativo');
        item.addClass('ativo');
        
        var source = $('a', item).attr('href');
        $('#imagem_ampliada img').attr('src', source);
        
        switch (direcao) {
        
          case plugin.settings.galeriaAnterior : 
          
            if(indiceAtual % window["limite_" + g] === 0){
              plugin.scrollGaleria(direcao, g);
            }
            
          break;
          
          case plugin.settings.galeriaProximo : 
          
            if(limite == window["limite_" + g]){
              plugin.scrollGaleria(direcao, g);
            }
          
          break;  
        
        }
        
      }

    };
    
    init();

  }

})(jQuery);
