// スクロールアニメーション

const fadeElements = document.querySelectorAll(".fade");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold:0.15
  }
);

fadeElements.forEach((element)=>{
  observer.observe(element);
});


// FAQ

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item)=>{

  const question = item.querySelector(".question");
  const answer = item.querySelector(".answer");

  question.addEventListener("click",()=>{

    item.classList.toggle("active");

    if(item.classList.contains("active")){
      answer.style.maxHeight =
      answer.scrollHeight + "px";
    }else{
      answer.style.maxHeight = null;
    }

  });

});


// CTAボタン表示制御

const fixedBtn = document.querySelector(".fixed-btn");

window.addEventListener("scroll",()=>{

  if(window.scrollY > 600){
    fixedBtn.style.opacity = "1";
  }else{
    fixedBtn.style.opacity = "0";
  }

});