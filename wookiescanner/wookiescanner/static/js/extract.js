(function(){
console.log("Javascript working");
var error = document.getElementById('error');


var obj = 
{
  validExtensions:['py','java','cs','c','c++'],
  reader: new FileReader(),
  regexp: "",
  file: "",
  extension : "",
  total_files:0,
  processed:0,
  modules : new Set(),
  readingMultiple : false
};

function apiSupport()
{
  if (window.File && window.FileReader && window.FileList && window.Blob)
   {
    return true;
  }
   else
   {
    return false;
  }
}

function readFile(file)
{
  if (apiSupport())
  {
    console.log("modules :"+obj.modules);
    if(obj.extension.toLowerCase() == "py")
    {
      obj.regexp = /import\D\S+/g;
      var p = new Python(obj);

    }
    else if (obj.extension.toLowerCase() == "java")
    {
      obj.regexp =/import\D\S+/g;
      var p = new Java(obj);
    }
    else if(obj.extension.toLowerCase() === "cs")
    {
      obj.regexp = /using\D\S+/g;
      var p = new Csharp(obj);
    }
    else if(obj.extension.toLowerCase() == "cpp" || obj.extension.toLowerCase() == "c"  )
    {
      obj.regexp =/#include\D\S+/g;
      var p = new C(obj);
    }
    else
    {
      if(!obj.readingMultiple)
      {
         error.textContent = obj.extension+ " File Type Is Not Supported Yet";
         error.style.color = "red";
         exit();
      }
    }

    try
    {
        obj.reader.readAsBinaryString(file);
    }
    catch(e)
    {
      error.textContent = e;
      error.style.color = "red";
    }
  }
  else
  {
    alert(apiSupport());
    alert("Your Browser Does not support FileReader Please use chrome or Firefox.");
    exit();
  }
}

// =====================================CHECKMODULES FUNCTION==============================
function checkModules()
{
  var files = document.getElementById('code_files').files;
  if (files.length == 0)
  {
    document.getElementById('error').textContent = "Please select files";
    document.getElementById('error').style.color = "red";
    return 0;
  }
  else
  {
    obj.total_files = files.length;

    if(obj.total_files > 1)
    {
      obj.readingMultiple = true;
    }

    for(var i=0;i<files.length;i++)
    {
      var filename = files[i].name;
      obj.extension = filename.split('.')[1];
      obj.reader = new FileReader();
      readFile(files[i]);
    }
          finished();
  }
}


function finished()
{
  // alert(obj.modules.size);
setTimeout(function()
{
  if (obj.modules.size > 0)
       {
         // alert();
        var mod =[];
        for(let item of obj.modules)
         {
           mod.push(item);
         }
        var myform = document.getElementById('myform');
        var inp = document.createElement('input');
        inp.id = 'val';
        inp.hidden = 'true';
        inp.name = "data";
        myform.appendChild(inp);
        var val = document.getElementById('val');
        val.value = mod;
        myform.submit();
      }
  else
      {
        error.textContent = "No modules found in your files";
        error.style.color = "red";
        return false;
    }
  },2000);
  error.style.color='black';
   // document.body.style.backgroundColor = 'hsl(180, 24%, 12%)';
   // showCanvas();
   // document.querySelector('canvas').style.display="block";
}

document.getElementById('scanFile').onclick = function(e){
  checkModules();
  // var files = document.getElementById('code_files').files;
  // if(files.length != 0)
  //   {
  //     alert('check modules');
  //     checkModules();
  //   }
  //   error.textContent = "Please select the files";
  //   error.style.color = "red";
  //   return false;
}


function processModule() {
  var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  var myform = document.getElementById("single_module");
  myform.method="POST";
  var cve_format = /CVE-\d\d\d\d-\d\d\d\d/gi;
  var date_format = /\d\d\d\d-\d\d-\d\d/gi;
  var date_format2 = /\d\d\d\d/gi;
  var module = document.getElementById('module').value.trim();
  var search = null; // default search
  if (module.length < 3 || module === "")
  {
    error.textContent = "It seems you have not entered a valid input";
    error.style.color = "red";
    return null;
  }
  else {
    if (cve_format.test(module)) {
      search = "cveid"; // search by cveid
    } else if (date_format.test(module)) {
      search = "date_published"; //search by date
    } else if (date_format2.test(module)) {
      search = "date-modified";
    } else {
      search = "summary"; //search by summary
    }
  }

  if (search != null) {
    // var myform = document.getElementById("single_module");
    myform.action = 'process';
    var inp = document.createElement('input');
    inp.name = "check";
    inp.id = "check";
    inp.hidden = "true";
    myform.appendChild(inp);
    document.getElementById('check').value = search;
    if (search === "summary") {
      if (!format.test(module) && isNaN(module)) {
        document.getElementById('single_module').submit();
      }
    }
    document.getElementById('single_module').submit();
  }
  return false;
}

//  check wheather the enter was pressed or not

document.getElementById('module').onkeypress = function(e){
  var event = e || window.event;
  var charcode = event.which || event.keycode;
  if(charcode == 13){
    processModule();
  }
}

document.getElementById('scanModule').onclick = function(e){
var module = document.getElementById('module').value;
if(module!=null && module!=" ")
  {
    processModule();
  }
  return false;
}
//----------------------------------------------------optional functions below--------------------------------
//function checkLength()
function checkLength() {
  document.getElementById('error').textContent = "";
  var ele = document.getElementById('module');
  var selected = document.getElementById('choose').value;

  if (selected == 'cveid') {
    len = 13;
  } else if (selected == "date_published" || selected == "date_modified") {
    len = 10;
  } else if (selected == "cvss_base") {
    len = 3;
    if (ele.value > 10 || ele.value < 0) {
      document.getElementById('error').textContent = "value should be between 0-10";
      console.log("executed");
      ele.value = "";
    }
  } else {
    return true;
  }

  var fieldLength = ele.value.length;
  if (fieldLength < len) {
    return true;
  } else {
    var str = ele.value;
    str = str.substring(0, len - 1);
    ele.value = str;
  }
}
// document.getElementById('module').addEventListener('keypress',checkLength);
// document.getElementById('choose').addEventListener('change',checkLength);

function filter() {
  var selected = document.getElementById('filter').value;
  alert(selected);
}
})();
