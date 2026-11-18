document.addEventListener("DOMContentLoaded", function() {
   
   showTable('build', buildings);
   const form = document.getElementById("graphForm");
   const errorMsg = document.getElementById("error-msg");
   const oyFieldset = document.getElementById("oyFieldset");

   const btnBuild = d3.select("#btnBuild");
   btnBuild.on("click", function() {

      const dataForm = {
         ox: form.elements["ox"].value,
         showMax: form.elements["oy"][0].checked,
         showMin: form.elements["oy"][1].checked,
         type: form.elements["chartType"].value
      };

      if (!dataForm.showMax && !dataForm.showMin) {
         errorMsg.style.display = "block";
         oyFieldset.style.border = "1px solid red";
         d3.select("#chart").selectAll("*").remove();
         return;
      } 
      else {
         errorMsg.style.display = "none";
         oyFieldset.style.border = "none";
      }

      drawGraph(buildings, dataForm);
      
   });

   const checkboxes = form.querySelectorAll('input[name="oy"]');
   checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', function() {
         const showMax = form.elements["oy"][0].checked;
         const showMin = form.elements["oy"][1].checked;

         if (showMax || showMin) {
            errorMsg.style.display = "none";
            oyFieldset.style.border = "none";
         }
      });
   });

   const btn = d3.select("#btn1");
   const table = d3.select("#build");
   btn.on("click", function() {
      if (btn.text() === "Скрыть таблицу") {
         btn.text("Показать таблицу");
         table.selectAll("*").remove();
      } else {
         btn.text("Скрыть таблицу");
         showTable('build', buildings);
      }
   });

   drawGraph(buildings, {
         ox: form.elements["ox"].value,
         showMax: form.elements["oy"][0].checked,
         showMin: form.elements["oy"][1].checked,
         type: form.elements["chartType"].value
   });
});