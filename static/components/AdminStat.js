
export default ({
  data() {
      return {
          plotDataSectionGraph: null
      };
  },
  mounted() {
      this.fetchGraphData();
  },
  methods: {
      fetchGraphData() {
          fetch('/api/lib/report')
              .then(response => response.json())
              .then(data => {
                  console.log('Data received:', data); // Debugging
                  this.plotDataSectionGraph = data.plot_data_section;
                  this.renderGraph();
              })
              .catch(error => {
                  console.error('Error fetching graph data:', error);
              });
      },
      renderGraph() {
          this.renderImage(this.plotDataSectionGraph, this.$refs.plotContainerSectionGraph);
      },
      renderImage(base64Data, container) {
          container.innerHTML = ''; // Clear previous images
          const img = new Image();
          img.className = 'img-fluid rounded shadow brown-border';
          img.src = 'data:image/png;base64,' + base64Data;
          img.style = 'width: 100%; height: 100%; max-width: 600px; border-radius: 10px;';
          img.onerror = () => {
              console.error('Error rendering image');
          };
          container.appendChild(img);
      }
  },
  template: `
 
      <div class="row justify-content-center">
        <div class="col-lg-6 mb-3">
          <div class="card custom-card shadow-lg" style="border-radius: 15px;">
            <div class="card-body text-center">
              <h5 class="card-title" style="color: brown;">Book Distribution by Section</h5>
              <div ref="plotContainerSectionGraph"></div>
              <p class="card-text mt-3" style="color: brown;">
                This 3D graph displays the distribution of books issued across different sections of the library.
                It helps in understanding which sections are most and least utilized, providing insights for better resource management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});
