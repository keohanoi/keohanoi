<div class="artwork-of-the-day">
  <style>
    .container {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
    }
  </style>
  <style>
    .artwork-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
  </style>

  <style>
    .artwork-origin {


      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      width: 100%;
    }
  </style>

  <style>
    .artwork-detail {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 500px
    }
  </style>

  <style>
    img {
      width: 500px;
      height: 500px;
    }
  </style>

  <div class="container">
    <div class="img-wrapper">
      <img
        src="{{img}}"
        alt="Charred Journal: Firewritten V" />
    </div>
    <div class="artwork-detail">
      <div class="artwork-origin"> 
        <h2 class="artwork-name">{{artwork}}</h2>
        <h3 class="artist">
          {{artist}}
        </h3>
      </div>
      <p class="description">
        {{des}}
      </p>
    </div>
  </div>

</div>
