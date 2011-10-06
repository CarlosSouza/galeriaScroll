$(document).ready(function(){


/*
  ----
    DEFINICOES GERAIS
  ----
*/

  
  var galeria = new $.galeriaScroll($('#galeria_demonstracao'), {
    paginacao : true,
    ampliacao : true
  });

  // Mostrar / esconder itens do indice
  $("#indice ol li h3").each(function(){
    if($('ol', $(this).parent()).size() > 0){
      $(this).after('<a class="expandir" href="#" title="Mostrar / esconder conteúdo">Mostrar / esconder</a>');
    }
  });
  $("#indice ol li ol").hide();
  $("#indice ol li a.expandir").click(function(){
    
    $(this).toggleClass("recolher");
    $(this).next().slideToggle("fast");
    
    return false;
  });
  
  
});