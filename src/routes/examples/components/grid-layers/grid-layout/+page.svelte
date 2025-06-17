<script>
  import { GridLayers } from '$lib/components/layout/index.js';
</script>

<GridLayers classes="m-20up border-8 w-[500px] h-[500px]">

  <!-- The inner component uses h-full -->
  <div class="justify-self-stretch self-stretch">
    <div class="bg-gray-300 w-full h-full p-[120px]">BG using w-full h-full</div>
  </div>

  <div class="justify-self-start self-start">
    <div class="bg-blue-500 w-[100px] h-[100px]">Top Left</div>
  </div>

  <div class="justify-self-center self-start">
    <div class="bg-indigo-500 w-[100px] h-[100px]">Top Center</div>
  </div>

  <div class="justify-self-end self-start">
    <div class="bg-violet-500 w-[100px] h-[100px]">Top Right</div>
  </div>

  <div class="justify-self-start self-center">
    <div class="bg-green-500 w-[100px] h-[100px]">Middle Left</div>
  </div>

  <div class="justify-self-center self-center">
    <div class="bg-emerald-500 w-[100px] h-[100px]">Middle Center</div>
  </div>

  <div class="justify-self-end self-center">
    <div class="bg-teal-500 w-[100px] h-[100px]">Middle Right</div>
  </div>

  <div class="justify-self-start self-end">
    <div class="bg-red-500 w-[100px] h-[100px]">Bottom Left</div>
  </div>

  <div class="justify-self-center self-end">
    <div class="bg-orange-500 w-[100px] h-[100px]">Bottom Center</div>
  </div>

  <!-- @note using margins for positioning -->
  <div class="justify-self-end self-end mr-20up mb-20up">
    <div class="bg-amber-500 w-[100px] h-[100px]">
      Bottom Right with margins
    </div>
  </div>

</GridLayers>

<GridLayers classes="m-20up border w-[500px] h-[500px]">

  <!-- The bg layer has grid positioning so contents fills -->
  <div data-layer="bg" class="justify-self-stretch self-stretch grid">
    <div class="bg-gray-500 p-[120px]">BG fill using extra grid</div>
  </div>

  <div class="justify-self-stretch">
    <div class="bg-blue-500 h-[100px]">Top Left Stretch</div>
  </div>
</GridLayers>
