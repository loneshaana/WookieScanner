function getPrevious()
{
 var previous = document.getElementById('previous'); 
 var mod = document.getElementById('previousmod').value;
 previous.submit();
}

function getNext()
{
 var next = document.getElementById('next'); 
 var mod = document.getElementById('nextmod').value;
 // alert(mod)
 next.submit();
}

document.getElementById('filter').addEventListener('click',function()
{
  document.getElementById('filterFORM').submit();
});