from django import forms

class certificate_form(forms.Form):
    certificate_id = forms.CharField(max_length=20)
    vpoker_stuid  = forms.CharField(max_length=20)
    pic = forms.ImageField()

 