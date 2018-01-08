
console.log("Javascript working");
var modules = "";
var total_files;
var processed = 0;
var error = document.querySelector('error');
function readFile(file) {
  var reader = new FileReader();
  // supports the file API
  if (apiSupport()) {
    reader.onload = function(evt) {
      console.log("Start reading");
      if (evt.target.readyState = FileReader.DONE) {
        var contents = evt.target.result; //content of a file

        var regexp = /import \S+/g; // regular expression

        var data = contents.match(regexp); //match the regular expression
        if (data != null) {
          for (var i = 0; i < data.length; i++) {
            data[i] = data[i].replace("import", " ").trim();
            if (data[i] != " ") {
              if (modules.indexOf(data[i]) == -1) {
                modules += data[i] + ",";
              }
            }
          }
        }
      }
    }
    reader.onloadend = function(evt) {
      console.log("Modules :" + modules);
      processed += 1;
      if (processed == total_files) {
        if (modules.length > 0) {
          var myform = document.getElementById('myform');
          var inp = document.createElement('input');
          inp.id = 'val';
          inp.hidden = 'true';
          inp.name = "data";
          myform.appendChild(inp);
          var val = document.getElementById('val');
          val.value = modules
          myform.submit();
        } else {
          alert("No modules in your file.Try with another file");
        }
      }
    }

    reader.readAsText(file);
  } else {
    alert("FIleReader API not supported");
  }
}

function apiSupport() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    return true;
  } else {
    return false;
  }
}

function checkModules() {
  var files = document.getElementById('code_files').files;
  if (files.length == 0) {
    document.getElementById('error').textContent = "Please select files";
    document.getElementById('error').style.color="red";
    return 0;
  } else {
    console.log("Got the file");
    total_files = files.length;
    for (var i = 0; i < files.length; i++) {
      readFile(files[i]);
    }
  }
}



function processModule()
{
 var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
 var cve_format = /CVE-\d\d\d\d-\d\d\d\d/gi;
 var date_format = /\d\d\d\d-\d\d-\d\d/gi;
 var date_format2 = /\d\d\d\d/gi;

 var module = document.getElementById('module').value.trim();
 var search =null; // default search
if(module.length <3 || module === "")
  {
        document.getElementById('error').textContent = "It seems you have not entered a valid input";
        document.getElementById('error').style.color="red";
        return null;
  }
else{
    if(cve_format.test(module)){
        search ="cveid";              // search by cveid
    } 
    else if(date_format.test(module)){
        search ="date_published";      //search by date
    }
    else if(date_format2.test(module)){
      search ="date-modified";
    }
    else {
      search ="summary";               //search by summary
    }
}

if(search)
{
  var myform = document.getElementById("single_module");
  var inp = document.createElement('input');
  inp.name = "check";
  inp.id = "check";
  inp.hidden ="true";
  myform.appendChild(inp);
  document.getElementById('check').value =search;
    if(search === "summary")
    {
      if(!format.test(module) && isNaN(module)){
        document.getElementById('single_module').submit();
      }
    }
    document.getElementById('single_module').submit();
}

}

// document.getElementById('tooltip').addEventListener('mouseover',function(){
//   alert("ToolTip");
// });



//----------------------------------------------------optional functions below--------------------------------
//function checkLength()
function checkLength(){
  document.getElementById('error').textContent="";
  var ele = document.getElementById('module');
  var selected = document.getElementById('choose').value;

  if(selected == 'cveid')
  {
      len = 13;
  }

  else if(selected == "date_published" || selected =="date_modified")
  {
      len = 10;
  }

  else if(selected == "cvss_base")
  {
      len =3;
      if(ele.value >10 || ele.value <0)
      {
        document.getElementById('error').textContent="value should be between 0-10";
        console.log("executed");
        ele.value ="";
      }
  }
  else
  {
      return true;
  }

  var fieldLength = ele.value.length;
  if(fieldLength < len)
  {
    return true;
  }
  else
  {
    var str = ele.value;
    str = str.substring(0, len-1);
    ele.value = str;
  }
}
// document.getElementById('module').addEventListener('keypress',checkLength);
// document.getElementById('choose').addEventListener('change',checkLength);


function filter()
{
    var selected = document.getElementById('filter').value;
    alert(selected);
}

