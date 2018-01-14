class Python {
  constructor(obj)
   {
    obj.reader.onload = function(evt)
     {
      if (evt.target.readyState == FileReader.DONE)
      {
        var contents = evt.target.result;
        var data = contents.match(obj.regexp);
        if (data != null)
        {
          for (var i = 0; i < data.length; i++)
          {
            data[i] = data[i].replace("import", " ").trim();
            if (data[i] != null)
            {
              var dataList = data[i].split(',');
              for (var j=0;j<dataList.length;j++)
              {
                obj.modules.add(dataList[j]);
              }
            }
          }
        }
      }
    }
  }
}
