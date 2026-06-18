// スクロールアニメーション

const fadeElements = document.querySelectorAll(".fade, .worries-animate");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold:0.08,
    rootMargin:"0px 0px 80px 0px"
  }
);

fadeElements.forEach((element) => {
  observer.observe(element);
  if (window.matchMedia("(max-width: 1024px)").matches) {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      element.classList.add("show");
    }
  }
});


// FAQ

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item)=>{

  const question = item.querySelector(".question");
  const answer = item.querySelector(".answer");

  if (!question || !answer) {
    return;
  }

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


// お問い合わせフォームの処理は index.html 内のスクリプトで行っています
// 改善事例スライダーは index.html 内のスクリプトで制御しています


// CTAボタン表示制御

const fixedBtn = document.querySelector(".fixed-btn");

if (fixedBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) {
      fixedBtn.style.opacity = "1";
    } else {
      fixedBtn.style.opacity = "0";
    }
  });
}
