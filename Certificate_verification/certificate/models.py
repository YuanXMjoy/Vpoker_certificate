from django.db import models
import json
# Create your models here.
def directory_path(instance,filename):
    return 'image/{0}-{1}'.format(instance.certificate_id,filename)

class certificate_data(models.Model):
    add_date = models.DateField(auto_now_add=True)
    certificate_id = models.CharField(max_length=20)
    vpoker_stuid  = models.CharField(max_length=20)
    pic = models.ImageField(upload_to = directory_path)

#    def toJSON(self):
#        fields = []
#        for field in self._meta.fields:
#            fields.append(field.name)
#        d = {}
#        for attr in fields:
#            val = getattr(self, attr)
#            
#            #如果是model类型，就要再一次执行model转json
#            if isinstance(val, models.Model):
#                val = json.loads(to_json(val))
#            d[attr] = val
#        return json.dumps(d)

    def toJSON(self):
        d = {}
        d["add_date"] = "-".join((str(self.add_date.day),str(self.add_date.month),str(self.add_date.year)))
        d["certificate_id"] = self.certificate_id
        d["vpoker_stuid"]   = self.vpoker_stuid
        d["pic"] = "certificate/imgfiles/"+str(self.pic)
        d["id"]  = str(self.id)

        return json.dumps(d)
