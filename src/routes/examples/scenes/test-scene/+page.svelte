<script>
  import { GridLayers } from '$lib/primitives/layout/index.js';
</script>

<GridLayers classes="w-full h-full">
  <div class="justify-self-start self-start">
    <div class="bg-blue-500 w-100up h-100up">Top Left</div>
  </div>
  <div class="justify-self-center self-start">
    <div class="bg-indigo-500 w-100up h-100up">Top Center</div>
  </div>
  <div class="justify-self-end self-start">
    <div class="bg-violet-500 w-100up h-100up">Top Right</div>
  </div>
  <div class="justify-self-start self-center">
    <div class="bg-green-500 w-100up h-100up">Middle Left</div>
  </div>
  <div class="justify-self-center self-center">
    <div class="bg-emerald-500 w-100up h-100up">Middle Center</div>
  </div>
  <div class="justify-self-end self-center">
    <div class="bg-teal-500 w-100up h-100up">Middle Right</div>
  </div>
  <div class="justify-self-start self-end">
    <div class="bg-red-500 w-100up h-100up">Bottom Left</div>
  </div>
  <div class="justify-self-center self-end">
    <div class="bg-orange-500 w-100up h-100up">Bottom Center</div>
  </div>

  <!-- @note using margins for positioning -->
  <div class="justify-self-end self-end mr-20up mb-20up">
    <div class="bg-amber-500 w-100up h-100up">Bottom Right with margins</div>
  </div>
</GridLayers>
