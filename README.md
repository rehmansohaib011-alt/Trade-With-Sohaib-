<style>
/* Card Container */
.my-card-box {
  width: 280px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

/* Card */
.my-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.10);
  transition: 0.4s ease;
}

/* Logo / Button */
.my-card-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: linear-gradient(135deg, #111827, #4b5563);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: 0.4s ease;
}

.my-card-logo:hover {
  transform: scale(1.08);
}

/* Hidden Content */
.my-card-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.4s ease;
}

/* Open Card */
.my-card.active .my-card-content {
  max-height: 300px;
  opacity: 1;
}

.my-card h3 {
  margin: 8px 0;
  font-size: 21px;
  color: #111827;
}

.my-card p {
  margin: 8px 0 15px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.my-card-btn {
  display: inline-block;
  padding: 9px 18px;
  border-radius: 20px;
  background: #111827;
  color: white;
  text-decoration: none;
  font-size: 13px;
}
</style>

<div class="my-card-box">

  <div class="my-card" id="myAnimatedCard">

    <div class="my-card-logo" onclick="toggleMyCard()">
      TWS
    </div>

    <div class="my-card-content">
      <h3>Trade With Sohaib</h3>

      <p>
        Welcome to my profile.  
        Learn, explore and discover more.
      </p>

      <a href="#" class="my-card-btn">View More</a>
    </div>

  </div>

</div>

<script>
function toggleMyCard() {
  document.getElementById("myAnimatedCard")
    .classList.toggle("active");
}
</script>
