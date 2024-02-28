window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const components = document.querySelectorAll('.container .componente');
  
    components.forEach(function(component, index) {
      // Ajuste o fator multiplicativo (2 neste caso) conforme necessário para a amplitude da onda
      const yOffset = Math.sin((scrollPosition / 200) + (index * 0.5)) * 20;
      component.style.transform = `translateY(${yOffset}px)`;
    });
  });
  

  