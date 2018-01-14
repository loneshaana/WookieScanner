class C {
  constructor(obj) {
    obj.reader.onload = function(evt) {
      if (evt.target.readyState == FileReader.DONE) {
        var contents = evt.target.result;
        var data = contents.match(obj.regexp);
        if (data != null)
        {
          for (var i = 0; i < data.length; i++)
           {
            data[i] = data[i].replace("#include", " ").trim();
            data[i] = data[i].replace("<"," ").trim();
            data[i] = data[i].replace(">"," ").trim();
            data[i] = data[i].replace("\" "," ").trim();
            data[i] = data[i].replace("\" "," ").trim();
            if (data[i] != null)
            {
                var str = data[i];
                var index = str.indexOf(';');
                if(index != -1)
                {
                  str = str.slice(0,index);
                }
                var index = str.indexOf('.*');
                if(index != -1)
                {
                  str = str.slice(0,index);
                }
                obj.modules.add(str);
            }
          }
        }
      }
    }
  }
}
