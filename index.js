import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://oaatowhxrefpjlwucvvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2P6[...]'
const supabase = createClient(supabaseUrl, supabaseKey)

async function loadSlides() {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('created_at', { ascending: false })
  const container = document.getElementById('slidePromoList')
  if (error) {
    container.innerHTML = `<div class="slide-empty">Error: ${error.message}</div>`
    return
  }
  if (!data.length) {
    container.innerHTML = `<div class="slide-empty">Belum ada slide promosi.</div>`
    return
  }
  container.innerHTML = data.map(s => `
    <div class="swiper-slide">
      <b>${s.title}</b><br>
      <div>${s.desc}</div>
      ${s.image_url ? `<img src="${s.image_url}" loading="lazy">` : ""}
      <small style="margin-top:auto;">${new Date(s.created_at).toLocaleString()}</small>
    </div>
  `).join('')

  // Inisialisasi Swiper setelah slides ter-load
  new Swiper('.swiper', {
    loop: data.length > 1, // Loop hanya jika lebih dari 1 slide
    autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false, // 15 detik otomatis geser
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    slidesPerView: 1,
    spaceBetween: 20,
    centeredSlides: true,
    allowTouchMove: true,
    // Responsive
    breakpoints: {
      700: { slidesPerView: 1 }
    }
  })
}

loadSlides()